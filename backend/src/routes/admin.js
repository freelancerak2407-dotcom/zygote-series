const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken, requireRole } = require('../middleware/auth');

// All admin routes require authentication and admin/editor role
router.use(verifyToken);
router.use(requireRole('admin', 'editor'));

// ==================== TRACKS ====================

// Create track
router.post('/tracks', async (req, res) => {
    try {
        const { name, description, yearNumber, displayOrder } = req.body;

        const result = await db.query(`
      INSERT INTO tracks (name, description, year_number, display_order, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, yearNumber, displayOrder, req.user.id]);

        // Log activity
        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, 'TRACK_CREATED', 'track', result.rows[0].id, JSON.stringify({ name })]);

        res.status(201).json({
            success: true,
            message: 'Track created successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create track error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create track.'
        });
    }
});

// Update track
router.put('/tracks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, yearNumber, displayOrder, isActive } = req.body;

        const result = await db.query(`
      UPDATE tracks
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          year_number = COALESCE($3, year_number),
          display_order = COALESCE($4, display_order),
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, yearNumber, displayOrder, isActive, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Track not found.'
            });
        }

        // Log activity
        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, 'TRACK_UPDATED', 'track', id, JSON.stringify(req.body)]);

        res.json({
            success: true,
            message: 'Track updated successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update track error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update track.'
        });
    }
});

// Delete track (soft delete)
router.delete('/tracks/:id', requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
      UPDATE tracks SET is_active = FALSE, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Track not found.'
            });
        }

        // Log activity
        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
      VALUES ($1, $2, $3, $4)
    `, [req.user.id, 'TRACK_DELETED', 'track', id]);

        res.json({
            success: true,
            message: 'Track deleted successfully.'
        });
    } catch (error) {
        console.error('Delete track error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete track.'
        });
    }
});

// ==================== SUBJECTS ====================

// Create subject
router.post('/subjects', async (req, res) => {
    try {
        const { trackId, name, description, iconUrl, colorCode, displayOrder, isFreeTrial } = req.body;

        const result = await db.query(`
      INSERT INTO subjects (track_id, name, description, icon_url, color_code, display_order, is_free_trial, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [trackId, name, description, iconUrl, colorCode, displayOrder, isFreeTrial || false, req.user.id]);

        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, 'SUBJECT_CREATED', 'subject', result.rows[0].id, JSON.stringify({ name })]);

        res.status(201).json({
            success: true,
            message: 'Subject created successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subject.'
        });
    }
});

// ==================== TOPICS ====================

// Create topic
router.post('/topics', async (req, res) => {
    try {
        const { subjectId, title, description, displayOrder, isFreeSample } = req.body;

        const result = await db.query(`
      INSERT INTO topics (subject_id, title, description, display_order, is_free_sample, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [subjectId, title, description, displayOrder, isFreeSample || false, req.user.id]);

        await db.query(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, 'TOPIC_CREATED', 'topic', result.rows[0].id, JSON.stringify({ title })]);

        res.status(201).json({
            success: true,
            message: 'Topic created successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create topic.'
        });
    }
});

// ==================== CONTENT ====================

// Create/Update notes
router.post('/topics/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, contentType, pdfUrl } = req.body;

        const result = await db.query(`
      INSERT INTO notes (topic_id, content, content_type, pdf_url, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, content, contentType || 'markdown', pdfUrl, req.user.id]);

        res.status(201).json({
            success: true,
            message: 'Notes created successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notes.'
        });
    }
});

// Create MCQ
router.post('/mcqs', async (req, res) => {
    try {
        const { topicId, question, optionA, optionB, optionC, optionD, correctAnswer, explanation, difficulty, displayOrder } = req.body;

        const result = await db.query(`
      INSERT INTO mcqs (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, display_order, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [topicId, question, optionA, optionB, optionC, optionD, correctAnswer, explanation, difficulty || 'moderate', displayOrder, req.user.id]);

        res.status(201).json({
            success: true,
            message: 'MCQ created successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create MCQ error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create MCQ.'
        });
    }
});

// Bulk create MCQs
router.post('/mcqs/bulk', async (req, res) => {
    try {
        const { mcqs } = req.body;

        if (!Array.isArray(mcqs) || mcqs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'MCQs array is required.'
            });
        }

        const created = [];

        for (const mcq of mcqs) {
            const result = await db.query(`
        INSERT INTO mcqs (topic_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, display_order, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [mcq.topicId, mcq.question, mcq.optionA, mcq.optionB, mcq.optionC, mcq.optionD, mcq.correctAnswer, mcq.explanation, mcq.difficulty || 'moderate', mcq.displayOrder, req.user.id]);

            created.push(result.rows[0]);
        }

        res.status(201).json({
            success: true,
            message: `${created.length} MCQs created successfully.`,
            data: created
        });
    } catch (error) {
        console.error('Bulk create MCQs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create MCQs.'
        });
    }
});

module.exports = router;
