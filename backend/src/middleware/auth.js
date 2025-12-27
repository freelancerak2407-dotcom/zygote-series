const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../database/connection');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);

            // Check if user still exists and is active
            const userResult = await db.query(
                'SELECT id, email, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            const user = userResult.rows[0];

            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated.'
                });
            }

            req.user = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

// Check if user has required role
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Check if user has active subscription
const requireSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Admins and editors bypass subscription check
        if (req.user.role === 'admin' || req.user.role === 'editor') {
            return next();
        }

        const subscriptionResult = await db.query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 
      AND status = 'active' 
      AND end_date > NOW()
      ORDER BY end_date DESC
      LIMIT 1
    `, [req.user.id]);

        if (subscriptionResult.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required to access this content.',
                code: 'SUBSCRIPTION_REQUIRED'
            });
        }

        req.subscription = subscriptionResult.rows[0];
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking subscription status.'
        });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const userResult = await db.query(
                'SELECT id, email, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
                req.user = {
                    id: userResult.rows[0].id,
                    email: userResult.rows[0].email,
                    role: userResult.rows[0].role
                };
            }
        } catch (error) {
            // Silently fail for optional auth
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    verifyToken,
    requireRole,
    requireSubscription,
    optionalAuth
};
