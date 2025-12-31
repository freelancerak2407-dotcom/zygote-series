const UserModel = require('../models/UserModel');
const emailService = require('../services/emailService');
const { generateToken, generateRefreshToken } = require('../utils/auth');
const config = require('../config');

class AuthController {
    /**
     * Register new user
     */
    async register(req, res) {
        try {
            const { email, password, fullName } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered',
                });
            }

            // Create user
            const user = await UserModel.create({
                email,
                password,
                fullName,
                role: 'student',
            });

            // Generate OTP
            const otp = emailService.generateOTP();
            const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);

            // Store OTP
            await UserModel.storeOTP(email, otp, expiresAt);

            // Send OTP email
            await emailService.sendOTP(email, otp, fullName);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please verify your email with the OTP sent.',
                data: {
                    userId: user.id,
                    email: user.email,
                    fullName: user.full_name,
                },
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed. Please try again.',
            });
        }
    }

    /**
     * Verify OTP
     */
    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;

            // Verify OTP
            const otpRecord = await UserModel.verifyOTP(email, otp);
            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP',
                });
            }

            // Get user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Mark user as verified
            await UserModel.markAsVerified(user.id);

            // Send welcome email
            await emailService.sendWelcome(email, user.full_name);

            // Generate tokens
            const accessToken = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Store refresh token
            const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await UserModel.storeRefreshToken(user.id, refreshToken, refreshTokenExpiry);

            res.json({
                success: true,
                message: 'Email verified successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role,
                        isVerified: true,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'OTP verification failed. Please try again.',
            });
        }
    }

    /**
     * Resend OTP
     */
    async resendOTP(req, res) {
        try {
            const { email } = req.body;

            // Check if user exists
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            if (user.is_verified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already verified',
                });
            }

            // Generate new OTP
            const otp = emailService.generateOTP();
            const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);

            // Store OTP
            await UserModel.storeOTP(email, otp, expiresAt);

            // Send OTP email
            await emailService.sendOTP(email, otp, user.full_name);

            res.json({
                success: true,
                message: 'OTP sent successfully',
            });
        } catch (error) {
            console.error('Resend OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to resend OTP. Please try again.',
            });
        }
    }

    /**
     * Login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Verify password
            const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Check if verified
            if (!user.is_verified) {
                // Resend OTP
                const otp = emailService.generateOTP();
                const expiresAt = new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000);
                await UserModel.storeOTP(email, otp, expiresAt);
                await emailService.sendOTP(email, otp, user.full_name);

                return res.status(403).json({
                    success: false,
                    message: 'Email not verified. A new OTP has been sent to your email.',
                    requiresVerification: true,
                });
            }

            // Update last login
            await UserModel.updateLastLogin(user.id);

            // Generate tokens
            const accessToken = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Store refresh token
            const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            await UserModel.storeRefreshToken(user.id, refreshToken, refreshTokenExpiry);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        role: user.role,
                        profilePicture: user.profile_picture,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed. Please try again.',
            });
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            // Verify refresh token
            const tokenRecord = await UserModel.findRefreshToken(refreshToken);
            if (!tokenRecord) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired refresh token',
                });
            }

            // Get user
            const user = await UserModel.findById(tokenRecord.user_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Generate new access token
            const accessToken = generateToken(user);

            res.json({
                success: true,
                data: {
                    accessToken,
                },
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'Token refresh failed',
            });
        }
    }

    /**
     * Logout
     */
    async logout(req, res) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await UserModel.deleteRefreshToken(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logout successful',
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed',
            });
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user data',
            });
        }
    }
}

module.exports = new AuthController();
