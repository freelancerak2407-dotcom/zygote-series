const db = require('../database/connection');
const bcrypt = require('bcryptjs');

class UserModel {
    /**
     * Create a new user
     */
    static async create({ email, password, fullName, role = 'student', googleId = null }) {
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db.query(`
            INSERT INTO users (email, password_hash, full_name, role, google_id, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, full_name, role, is_verified, created_at
        `, [email, passwordHash, fullName, role, googleId, googleId ? true : false]);

        return result.rows[0];
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const result = await db.query(`
            SELECT * FROM users WHERE email = $1 AND is_active = TRUE
        `, [email]);

        return result.rows[0] || null;
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        const result = await db.query(`
            SELECT id, email, full_name, role, is_verified, is_active, 
                   profile_picture, created_at, last_login
            FROM users 
            WHERE id = $1 AND is_active = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Find user by Google ID
     */
    static async findByGoogleId(googleId) {
        const result = await db.query(`
            SELECT * FROM users WHERE google_id = $1 AND is_active = TRUE
        `, [googleId]);

        return result.rows[0] || null;
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Update user verification status
     */
    static async markAsVerified(userId) {
        const result = await db.query(`
            UPDATE users 
            SET is_verified = TRUE, updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, is_verified
        `, [userId]);

        return result.rows[0];
    }

    /**
     * Update last login
     */
    static async updateLastLogin(userId) {
        await db.query(`
            UPDATE users SET last_login = NOW() WHERE id = $1
        `, [userId]);
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId, { fullName, profilePicture }) {
        const result = await db.query(`
            UPDATE users 
            SET full_name = COALESCE($1, full_name),
                profile_picture = COALESCE($2, profile_picture),
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, email, full_name, profile_picture
        `, [fullName, profilePicture, userId]);

        return result.rows[0];
    }

    /**
     * Get all users (admin only)
     */
    static async getAll({ role, isVerified, limit = 50, offset = 0 }) {
        let query = 'SELECT id, email, full_name, role, is_verified, is_active, created_at, last_login FROM users WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (role) {
            query += ` AND role = $${paramCount}`;
            params.push(role);
            paramCount++;
        }

        if (isVerified !== undefined) {
            query += ` AND is_verified = $${paramCount}`;
            params.push(isVerified);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Deactivate user (soft delete)
     */
    static async deactivate(userId) {
        const result = await db.query(`
            UPDATE users 
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, is_active
        `, [userId]);

        return result.rows[0];
    }

    /**
     * Store OTP
     */
    static async storeOTP(email, otpCode, expiresAt) {
        const result = await db.query(`
            INSERT INTO otp_verifications (email, otp_code, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [email, otpCode, expiresAt]);

        return result.rows[0];
    }

    /**
     * Verify OTP
     */
    static async verifyOTP(email, otpCode) {
        const result = await db.query(`
            SELECT * FROM otp_verifications
            WHERE email = $1 
            AND otp_code = $2 
            AND expires_at > NOW()
            AND is_used = FALSE
            ORDER BY created_at DESC
            LIMIT 1
        `, [email, otpCode]);

        if (result.rows.length === 0) {
            return null;
        }

        // Mark OTP as used
        await db.query(`
            UPDATE otp_verifications 
            SET is_used = TRUE 
            WHERE id = $1
        `, [result.rows[0].id]);

        return result.rows[0];
    }

    /**
     * Store refresh token
     */
    static async storeRefreshToken(userId, token, expiresAt) {
        const result = await db.query(`
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [userId, token, expiresAt]);

        return result.rows[0];
    }

    /**
     * Find refresh token
     */
    static async findRefreshToken(token) {
        const result = await db.query(`
            SELECT * FROM refresh_tokens
            WHERE token = $1 AND expires_at > NOW()
        `, [token]);

        return result.rows[0] || null;
    }

    /**
     * Delete refresh token
     */
    static async deleteRefreshToken(token) {
        await db.query(`
            DELETE FROM refresh_tokens WHERE token = $1
        `, [token]);
    }
}

module.exports = UserModel;
