const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { optionalAuth } = require('../middleware/auth');

// Public routes (students can view)
router.get('/:id', optionalAuth, contentController.getSubjectById);
router.get('/:subjectId/topics', optionalAuth, contentController.getTopicsBySubject);

module.exports = router;
