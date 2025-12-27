const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { optionalAuth } = require('../middleware/auth');

// Get all tracks
router.get('/', optionalAuth, async (req, res) => {
    try {
        const result = await db.query(`
      SELECT id, name, description, year_number, display_order, is_active, created_at
      FROM tracks
      WHERE is_active = TRUE
      ORDER BY display_order ASC
    `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get tracks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tracks.'
        });
    }
});

// Get track by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT * FROM tracks WHERE id = $1 AND is_active = TRUE
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Track not found.'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get track error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch track.'
        });
    }
});

// Get subjects by track
router.get('/:id/subjects', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT id, name, description, icon_url, color_code, display_order, is_free_trial
      FROM subjects
      WHERE track_id = $1 AND is_active = TRUE
      ORDER BY display_order ASC
    `, [id]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects.'
        });
    }
});

module.exports = router;
