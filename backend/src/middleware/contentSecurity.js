/**
 * Content Security Middleware
 * Backend middleware to add security headers and watermarking
 */

const config = require('../config');

/**
 * Add security headers to prevent downloads and caching
 */
const addSecurityHeaders = (req, res, next) => {
    // Prevent caching of sensitive content
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Prevent embedding in iframes (clickjacking protection)
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
    );

    // Prevent download attribute
    res.setHeader('X-Download-Options', 'noopen');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'no-referrer');

    next();
};

/**
 * Add watermark metadata to content
 */
const addWatermarkMetadata = (userId, userEmail) => {
    return {
        watermark: {
            userId: userId,
            userEmail: userEmail,
            timestamp: new Date().toISOString(),
            message: `ZYGOTE - ${userEmail} - ${new Date().toLocaleDateString()}`,
        },
    };
};

/**
 * Validate content access permissions
 */
const validateContentAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const contentId = req.params.id || req.params.topicId;

        // Check if user has active subscription
        const SubscriptionModel = require('../models/SubscriptionModel');
        const hasAccess = await SubscriptionModel.hasActiveSubscription(userId);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required to access this content',
            });
        }

        // Log content access for audit trail
        const AnalyticsModel = require('../models/AnalyticsModel');
        await AnalyticsModel.logContentAccess({
            userId: userId,
            contentId: contentId,
            contentType: req.path.includes('notes') ? 'notes' :
                req.path.includes('summary') ? 'summary' :
                    req.path.includes('mindmap') ? 'mindmap' : 'unknown',
            accessedAt: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        next();
    } catch (error) {
        console.error('Content access validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate content access',
        });
    }
};

/**
 * Rate limit content downloads
 */
const contentDownloadLimiter = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each user to 50 content requests per window
    message: 'Too many content requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID for rate limiting
        return req.user ? req.user.id : req.ip;
    },
});

/**
 * Prevent direct file access
 */
const preventDirectFileAccess = (req, res, next) => {
    // Check if request has valid authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access to content',
        });
    }

    next();
};

/**
 * Add content expiry
 */
const addContentExpiry = (hours = 24) => {
    return (req, res, next) => {
        // Add expiry timestamp to response
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + hours);

        res.locals.contentExpiry = expiryTime.toISOString();

        next();
    };
};

module.exports = {
    addSecurityHeaders,
    addWatermarkMetadata,
    validateContentAccess,
    contentDownloadLimiter,
    preventDirectFileAccess,
    addContentExpiry,
};
