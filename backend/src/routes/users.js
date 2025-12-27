const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get user preferences
router.get('/preferences', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT * FROM user_preferences WHERE user_id = $1
    `, [req.user.id]);

        if (result.rows.length === 0) {
            // Create default preferences
            const newPrefs = await db.query(`
        INSERT INTO user_preferences (user_id, theme, font_size, notifications_enabled)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [req.user.id, 'light', 'medium', true]);

            return res.json({
                success: true,
                data: newPrefs.rows[0]
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences.'
        });
    }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
    try {
        const { theme, fontSize, notificationsEnabled } = req.body;

        const result = await db.query(`
      INSERT INTO user_preferences (user_id, theme, font_size, notifications_enabled)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE
      SET theme = COALESCE($2, user_preferences.theme),
          font_size = COALESCE($3, user_preferences.font_size),
          notifications_enabled = COALESCE($4, user_preferences.notifications_enabled),
          updated_at = NOW()
      RETURNING *
    `, [req.user.id, theme, fontSize, notificationsEnabled]);

        res.json({
            success: true,
            message: 'Preferences updated successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences.'
        });
    }
});

// Get bookmarks
router.get('/bookmarks', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT b.id, b.created_at, t.id as topic_id, t.title, t.description,
             s.name as subject_name, s.color_code
      FROM bookmarks b
      JOIN topics t ON b.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookmarks.'
        });
    }
});

// Add bookmark
router.post('/bookmarks', async (req, res) => {
    try {
        const { topicId } = req.body;

        const result = await db.query(`
      INSERT INTO bookmarks (user_id, topic_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, topic_id) DO NOTHING
      RETURNING *
    `, [req.user.id, topicId]);

        res.status(201).json({
            success: true,
            message: 'Bookmark added successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Add bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add bookmark.'
        });
    }
});

// Remove bookmark
router.delete('/bookmarks/:topicId', async (req, res) => {
    try {
        const { topicId } = req.params;

        await db.query(`
      DELETE FROM bookmarks WHERE user_id = $1 AND topic_id = $2
    `, [req.user.id, topicId]);

        res.json({
            success: true,
            message: 'Bookmark removed successfully.'
        });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove bookmark.'
        });
    }
});

// Get user analytics
router.get('/analytics', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        COUNT(DISTINCT topic_id) as topics_opened,
        SUM(time_spent_seconds) as total_time_spent,
        AVG(CASE WHEN quiz_score_percentage IS NOT NULL THEN quiz_score_percentage END) as avg_quiz_score,
        COUNT(CASE WHEN activity_type = 'quiz_attempted' THEN 1 END) as quizzes_attempted
      FROM analytics
      WHERE user_id = $1
    `, [req.user.id]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics.'
        });
    }
});

module.exports = router;
