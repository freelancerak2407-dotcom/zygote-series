const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, optionalAuth } = require('../middleware/auth');

// Get topic by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT t.*, s.name as subject_name, s.color_code
      FROM topics t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = $1 AND t.is_active = TRUE
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found.'
            });
        }

        // Track analytics if user is logged in
        if (req.user) {
            await db.query(`
        INSERT INTO analytics (user_id, topic_id, activity_type, time_spent_seconds)
        VALUES ($1, $2, $3, $4)
      `, [req.user.id, id, 'opened', 0]);
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topic.'
        });
    }
});

// Get notes for topic
router.get('/:id/notes', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT content, content_type, pdf_url, version, updated_at
      FROM notes
      WHERE topic_id = $1 AND is_active = TRUE
      ORDER BY version DESC
      LIMIT 1
    `, [id]);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No notes available for this topic.'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes.'
        });
    }
});

// Get summary for topic
router.get('/:id/summary', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT content, content_type, pdf_url, version, updated_at
      FROM summaries
      WHERE topic_id = $1 AND is_active = TRUE
      ORDER BY version DESC
      LIMIT 1
    `, [id]);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No summary available for this topic.'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary.'
        });
    }
});

// Get mind map for topic
router.get('/:id/mindmap', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      SELECT image_url, image_type, thumbnail_url, version, updated_at
      FROM mind_maps
      WHERE topic_id = $1 AND is_active = TRUE
      ORDER BY version DESC
      LIMIT 1
    `, [id]);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No mind map available for this topic.'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get mind map error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch mind map.'
        });
    }
});

// Get MCQs for topic
router.get('/:id/mcqs', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { difficulty, limit = 20 } = req.query;

        let query = `
      SELECT id, question, option_a, option_b, option_c, option_d, 
             correct_answer, explanation, difficulty
      FROM mcqs
      WHERE topic_id = $1 AND is_active = TRUE
    `;

        const params = [id];

        if (difficulty) {
            query += ` AND difficulty = $2`;
            params.push(difficulty);
        }

        query += ` ORDER BY display_order ASC, RANDOM() LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get MCQs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch MCQs.'
        });
    }
});

// Submit MCQ answer (track analytics)
router.post('/:id/mcqs/:mcqId/submit', verifyToken, async (req, res) => {
    try {
        const { id, mcqId } = req.params;
        const { selectedAnswer, timeSpent } = req.body;

        // Get correct answer
        const mcqResult = await db.query(
            'SELECT correct_answer FROM mcqs WHERE id = $1',
            [mcqId]
        );

        if (mcqResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'MCQ not found.'
            });
        }

        const isCorrect = mcqResult.rows[0].correct_answer === selectedAnswer;

        // Track analytics
        await db.query(`
      INSERT INTO analytics (user_id, topic_id, activity_type, time_spent_seconds, quiz_score_percentage)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, id, 'quiz_attempted', timeSpent || 0, isCorrect ? 100 : 0]);

        res.json({
            success: true,
            data: {
                isCorrect,
                correctAnswer: mcqResult.rows[0].correct_answer
            }
        });
    } catch (error) {
        console.error('Submit MCQ error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit answer.'
        });
    }
});

module.exports = router;
