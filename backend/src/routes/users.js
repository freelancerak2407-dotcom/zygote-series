const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');
const { uploadProfilePicture, handleUploadError } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(verifyToken);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/profile/picture', uploadProfilePicture, handleUploadError, userController.uploadProfilePicture);

// Bookmark routes
router.get('/bookmarks', userController.getBookmarks);
router.post('/bookmarks/:topicId', userController.addBookmark);
router.delete('/bookmarks/:topicId', userController.removeBookmark);

// Activity routes
router.get('/activity', userController.getActivity);
router.post('/activity', analyticsController.trackActivity);

// Analytics routes
router.get('/analytics', analyticsController.getUserStats);

module.exports = router;
