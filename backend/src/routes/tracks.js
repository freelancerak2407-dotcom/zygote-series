const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { optionalAuth } = require('../middleware/auth');

// Public routes (students can view)
router.get('/', optionalAuth, contentController.getAllTracks);
router.get('/:id', optionalAuth, contentController.getTrackById);
router.get('/:trackId/subjects', optionalAuth, contentController.getSubjectsByTrack);

module.exports = router;
