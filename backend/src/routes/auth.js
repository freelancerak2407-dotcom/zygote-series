const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const {
    generateToken,
    generateRefreshToken,
    hashPassword,
    comparePassword,
    generateOTP,
    getOTPExpiry,
    isValidEmail,
    isValidPassword
} = require('../utils/auth');
const { verifyToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validation
        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and full name are required.'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
            });
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const userResult = await db.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, full_name, role, created_at
    `, [email.toLowerCase(), passwordHash, fullName, 'student', false, true]);

        const user = userResult.rows[0];

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiry = getOTPExpiry();

        await db.query(`
      INSERT INTO otp_verifications (user_id, email, otp_code, expires_at)
      VALUES ($1, $2, $3, $4)
    `, [user.id, email.toLowerCase(), otpCode, otpExpiry]);

        // TODO: Send OTP email
        console.log(`OTP for ${email}: ${otpCode}`);

        // Log activity
        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [user.id, 'USER_REGISTERED', 'user', user.id, JSON.stringify({ email })]);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for OTP verification.',
            data: {
                userId: user.id,
                email: user.email,
                fullName: user.full_name,
                otpSent: true
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Find user
        const userResult = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = userResult.rows[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check if email is verified (only for students)
        if (user.role === 'student' && !user.is_verified) {
            // Generate new OTP
            const otpCode = generateOTP();
            const otpExpiry = getOTPExpiry();

            await db.query(`
        INSERT INTO otp_verifications (user_id, email, otp_code, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [user.id, email.toLowerCase(), otpCode, otpExpiry]);

            console.log(`OTP for ${email}: ${otpCode}`);

            return res.status(403).json({
                success: false,
                message: 'Email not verified. OTP sent to your email.',
                code: 'EMAIL_NOT_VERIFIED',
                data: { userId: user.id, email: user.email }
            });
        }

        // Generate tokens
        const token = generateToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 30);

        await db.query(`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, refreshToken, refreshExpiry]);

        // Update last login
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Log activity
        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, $3, $4)
    `, [user.id, 'USER_LOGIN', 'user', user.id]);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    profilePicture: user.profile_picture
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP code are required.'
            });
        }

        // Find valid OTP
        const otpResult = await db.query(`
      SELECT * FROM otp_verifications
      WHERE email = $1 AND otp_code = $2 AND is_used = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [email.toLowerCase(), otpCode]);

        if (otpResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP.'
            });
        }

        const otp = otpResult.rows[0];

        // Mark OTP as used
        await db.query(
            'UPDATE otp_verifications SET is_used = TRUE WHERE id = $1',
            [otp.id]
        );

        // Verify user
        await db.query(
            'UPDATE users SET is_verified = TRUE WHERE id = $1',
            [otp.user_id]
        );

        // Get user details
        const userResult = await db.query(
            'SELECT id, email, full_name, role FROM users WHERE id = $1',
            [otp.user_id]
        );

        const user = userResult.rows[0];

        // Generate tokens
        const token = generateToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 30);

        await db.query(`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, refreshToken, refreshExpiry]);

        res.json({
            success: true,
            message: 'Email verified successfully.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        // Find user
        const userResult = await db.query(
            'SELECT id, is_verified FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified.'
            });
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const otpExpiry = getOTPExpiry();

        await db.query(`
      INSERT INTO otp_verifications (user_id, email, otp_code, expires_at)
      VALUES ($1, $2, $3, $4)
    `, [user.id, email.toLowerCase(), otpCode, otpExpiry]);

        // TODO: Send OTP email
        console.log(`OTP for ${email}: ${otpCode}`);

        res.json({
            success: true,
            message: 'OTP sent successfully. Please check your email.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP. Please try again.'
        });
    }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userResult = await db.query(`
      SELECT id, email, full_name, role, profile_picture, created_at, last_login
      FROM users WHERE id = $1
    `, [req.user.id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = userResult.rows[0];

        // Get subscription if student
        let subscription = null;
        if (user.role === 'student') {
            const subResult = await db.query(`
        SELECT * FROM subscriptions
        WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
        ORDER BY end_date DESC
        LIMIT 1
      `, [user.id]);

            if (subResult.rows.length > 0) {
                subscription = subResult.rows[0];
            }
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                    profilePicture: user.profile_picture,
                    createdAt: user.created_at,
                    lastLogin: user.last_login
                },
                subscription
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user details.'
        });
    }
});

// Logout
router.post('/logout', verifyToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Delete refresh token
            await db.query(
                'DELETE FROM refresh_tokens WHERE token = $1',
                [refreshToken]
            );
        }

        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed.'
        });
    }
});

module.exports = router;
