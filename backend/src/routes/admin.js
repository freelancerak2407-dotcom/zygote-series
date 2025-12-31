const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const mcqController = require('../controllers/mcqController');
const userController = require('../controllers/userController');
const subscriptionController = require('../controllers/subscriptionController');
const analyticsController = require('../controllers/analyticsController');
const contentValidators = require('../validators/contentValidator');
const mcqValidators = require('../validators/mcqValidator');
const { verifyToken, requireRole } = require('../middleware/auth');
const { uploadPDF, uploadImage, handleUploadError } = require('../middleware/uploadMiddleware');

// All admin routes require authentication and admin/editor role
router.use(verifyToken);
router.use(requireRole('admin', 'editor'));

// ==================== TRACKS ====================
router.post('/tracks', contentValidators.createTrack, contentController.createTrack);
router.put('/tracks/:id', contentValidators.updateTrack, contentController.updateTrack);
router.delete('/tracks/:id', requireRole('admin'), contentController.deleteTrack);

// ==================== SUBJECTS ====================
router.get('/subjects', contentController.getAllSubjects);
router.post('/subjects', contentValidators.createSubject, contentController.createSubject);
router.put('/subjects/:id', contentValidators.updateSubject, contentController.updateSubject);
router.delete('/subjects/:id', requireRole('admin'), contentController.deleteSubject);

// ==================== TOPICS ====================
router.get('/topics', contentController.getAllTopics);
router.post('/topics', contentValidators.createTopic, contentController.createTopic);
router.put('/topics/:id', contentValidators.updateTopic, contentController.updateTopic);
router.delete('/topics/:id', requireRole('admin'), contentController.deleteTopic);

// ==================== TOPIC CONTENT ====================
router.post('/topics/:id/notes', contentValidators.createNotes, contentController.createNotes);
router.post('/topics/:id/summary', contentValidators.createSummary, contentController.createSummary);
router.post('/topics/:id/mindmap', contentValidators.createMindMap, contentController.createMindMap);

// ==================== MCQs ====================
router.get('/mcqs', mcqController.getAllMCQs);
router.post('/mcqs', mcqValidators.createMCQ, mcqController.createMCQ);
router.post('/mcqs/bulk', mcqValidators.bulkCreateMCQs, mcqController.bulkCreateMCQs);
router.put('/mcqs/:id', mcqValidators.updateMCQ, mcqController.updateMCQ);
router.delete('/mcqs/:id', requireRole('admin'), mcqController.deleteMCQ);
router.get('/mcqs/topic/:topicId/stats', mcqController.getTopicStats);

// ==================== FILE UPLOADS ====================
router.post('/upload/pdf', uploadPDF, handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const uploadService = require('../services/uploadService');
        const result = await uploadService.uploadPDF(req.file);

        res.json({
            success: true,
            message: 'PDF uploaded successfully',
            data: {
                url: result.url,
                key: result.key,
            },
        });
    } catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload PDF',
        });
    }
});

router.post('/upload/image', uploadImage, handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const uploadService = require('../services/uploadService');
        const result = await uploadService.uploadImage(req.file);

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.url,
                key: result.key,
            },
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image',
        });
    }
});

// ==================== USER MANAGEMENT ====================
router.get('/users', userController.getAllUsers);
router.delete('/users/:id', requireRole('admin'), userController.deactivateUser);

// ==================== SUBSCRIPTIONS ====================
router.get('/subscriptions', subscriptionController.getAllSubscriptions);
router.get('/subscriptions/stats', subscriptionController.getSubscriptionStats);

// ==================== ANALYTICS ====================
router.get('/analytics/platform', analyticsController.getPlatformStats);
router.get('/analytics/topic/:topicId', analyticsController.getTopicStats);
router.get('/analytics/logs', analyticsController.getActivityLogs);

module.exports = router;
