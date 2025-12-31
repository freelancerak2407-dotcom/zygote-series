const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const mcqController = require('../controllers/mcqController');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const {
    addSecurityHeaders,
    validateContentAccess,
    contentDownloadLimiter,
    preventDirectFileAccess,
    addContentExpiry,
} = require('../middleware/contentSecurity');

// Public routes (students can view)
router.get('/:id', optionalAuth, contentController.getTopicById);

// Protected content routes (require authentication + security)
router.get(
    '/:id/notes',
    verifyToken,
    addSecurityHeaders,
    validateContentAccess,
    contentDownloadLimiter,
    preventDirectFileAccess,
    addContentExpiry(24),
    contentController.getNotes
);

router.get(
    '/:id/summary',
    verifyToken,
    addSecurityHeaders,
    validateContentAccess,
    contentDownloadLimiter,
    addContentExpiry(24),
    contentController.getSummary
);

router.get(
    '/:id/mindmap',
    verifyToken,
    addSecurityHeaders,
    validateContentAccess,
    contentDownloadLimiter,
    preventDirectFileAccess,
    addContentExpiry(24),
    contentController.getMindMap
);

router.get('/:topicId/mcqs', optionalAuth, mcqController.getMCQsByTopic);

// Protected routes (require authentication)
router.post('/:topicId/mcqs/:id/check', verifyToken, mcqController.checkAnswer);

module.exports = router;
