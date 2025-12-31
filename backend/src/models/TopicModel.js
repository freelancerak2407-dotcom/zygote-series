const db = require('../database/connection');

class TopicModel {
    /**
     * Get all topics by subject
     */
    static async getBySubject(subjectId) {
        const result = await db.query(`
            SELECT * FROM topics 
            WHERE subject_id = $1 AND is_active = TRUE 
            ORDER BY display_order ASC
        `, [subjectId]);

        return result.rows;
    }

    /**
     * Get topic by ID
     */
    static async findById(id) {
        const result = await db.query(`
            SELECT t.*, s.name as subject_name, s.track_id
            FROM topics t
            JOIN subjects s ON s.id = t.subject_id
            WHERE t.id = $1 AND t.is_active = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get topic with all content
     */
    static async getWithContent(id) {
        const topic = await this.findById(id);
        if (!topic) return null;

        // Get notes
        const notesResult = await db.query(`
            SELECT * FROM notes 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY version DESC LIMIT 1
        `, [id]);
        topic.notes = notesResult.rows[0] || null;

        // Get summary
        const summaryResult = await db.query(`
            SELECT * FROM summaries 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY version DESC LIMIT 1
        `, [id]);
        topic.summary = summaryResult.rows[0] || null;

        // Get mind map
        const mindMapResult = await db.query(`
            SELECT * FROM mind_maps 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY version DESC LIMIT 1
        `, [id]);
        topic.mindMap = mindMapResult.rows[0] || null;

        // Get MCQ count
        const mcqResult = await db.query(`
            SELECT COUNT(*) as count FROM mcqs 
            WHERE topic_id = $1 AND is_active = TRUE
        `, [id]);
        topic.mcqCount = parseInt(mcqResult.rows[0].count);

        return topic;
    }

    /**
     * Create new topic
     */
    static async create({ subjectId, title, description, displayOrder, isFreeSample, createdBy }) {
        const result = await db.query(`
            INSERT INTO topics (subject_id, title, description, display_order, is_free_sample, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [subjectId, title, description, displayOrder, isFreeSample || false, createdBy]);

        return result.rows[0];
    }

    /**
     * Update topic
     */
    static async update(id, { title, description, displayOrder, isFreeSample, isActive, completionPercentage }) {
        const result = await db.query(`
            UPDATE topics
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                display_order = COALESCE($3, display_order),
                is_free_sample = COALESCE($4, is_free_sample),
                is_active = COALESCE($5, is_active),
                completion_percentage = COALESCE($6, completion_percentage),
                updated_at = NOW(),
                version = version + 1
            WHERE id = $7
            RETURNING *
        `, [title, description, displayOrder, isFreeSample, isActive, completionPercentage, id]);

        return result.rows[0] || null;
    }

    /**
     * Soft delete topic
     */
    static async delete(id) {
        const result = await db.query(`
            UPDATE topics 
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Create/Update notes
     */
    static async createNotes({ topicId, content, contentType, pdfUrl, createdBy }) {
        const result = await db.query(`
            INSERT INTO notes (topic_id, content, content_type, pdf_url, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [topicId, content, contentType || 'markdown', pdfUrl, createdBy]);

        return result.rows[0];
    }

    /**
     * Create/Update summary
     */
    static async createSummary({ topicId, content, contentType, pdfUrl, createdBy }) {
        const result = await db.query(`
            INSERT INTO summaries (topic_id, content, content_type, pdf_url, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [topicId, content, contentType || 'markdown', pdfUrl, createdBy]);

        return result.rows[0];
    }

    /**
     * Create/Update mind map
     */
    static async createMindMap({ topicId, imageUrl, imageType, thumbnailUrl, createdBy }) {
        const result = await db.query(`
            INSERT INTO mind_maps (topic_id, image_url, image_type, thumbnail_url, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [topicId, imageUrl, imageType || 'png', thumbnailUrl, createdBy]);

        return result.rows[0];
    }

    /**
     * Get notes for topic
     */
    static async getNotes(topicId) {
        const result = await db.query(`
            SELECT * FROM notes 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY version DESC LIMIT 1
        `, [topicId]);

        return result.rows[0] || null;
    }

    /**
     * Get summary for topic
     */
    static async getSummary(topicId) {
        const result = await db.query(`
            SELECT * FROM summaries 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY version DESC LIMIT 1
        `, [topicId]);

        return result.rows[0] || null;
    }

    /**
     * Get mind map for topic
     */
    static async getMindMap(topicId) {
        const result = await db.query(`
            SELECT * FROM mind_maps 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY version DESC LIMIT 1
        `, [topicId]);

        return result.rows[0] || null;
    }

    /**
     * Get all topics (admin)
     */
    static async getAll({ limit = 100, offset = 0 }) {
        const result = await db.query(`
            SELECT t.*, s.name as subject_name, s.track_id,
                   COUNT(DISTINCT n.id) as has_notes,
                   COUNT(DISTINCT sm.id) as has_summary,
                   COUNT(DISTINCT mm.id) as has_mindmap,
                   COUNT(DISTINCT m.id) as mcq_count
            FROM topics t
            JOIN subjects s ON s.id = t.subject_id
            LEFT JOIN notes n ON n.topic_id = t.id AND n.is_active = TRUE
            LEFT JOIN summaries sm ON sm.topic_id = t.id AND sm.is_active = TRUE
            LEFT JOIN mind_maps mm ON mm.topic_id = t.id AND mm.is_active = TRUE
            LEFT JOIN mcqs m ON m.topic_id = t.id AND m.is_active = TRUE
            WHERE t.is_active = TRUE
            GROUP BY t.id, s.name, s.track_id
            ORDER BY t.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        return result.rows;
    }
}

module.exports = TopicModel;
