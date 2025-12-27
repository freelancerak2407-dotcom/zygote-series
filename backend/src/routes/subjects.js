const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { optionalAuth } = require('../middleware/auth');

// Get subject by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT s.*, t.name as track_name, t.year_number
      FROM subjects s
      LEFT JOIN tracks t ON s.track_id = t.id
      WHERE s.id = $1 AND s.is_active = TRUE
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found.'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subject.'
        });
    }
});

// Get topics by subject
router.get('/:id/topics', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT id, title, description, display_order, is_free_sample, completion_percentage
      FROM topics
      WHERE subject_id = $1 AND is_active = TRUE
      ORDER BY display_order ASC
    `, [id]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topics.'
        });
    }
});

module.exports = router;
