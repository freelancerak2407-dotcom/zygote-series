const db = require('../database/connection');

class SubjectModel {
    /**
     * Get all subjects by track
     */
    static async getByTrack(trackId) {
        const result = await db.query(`
            SELECT * FROM subjects 
            WHERE track_id = $1 AND is_active = TRUE 
            ORDER BY display_order ASC
        `, [trackId]);

        return result.rows;
    }

    /**
     * Get subject by ID
     */
    static async findById(id) {
        const result = await db.query(`
            SELECT s.*, t.name as track_name, t.year_number
            FROM subjects s
            JOIN tracks t ON t.id = s.track_id
            WHERE s.id = $1 AND s.is_active = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Create new subject
     */
    static async create({ trackId, name, description, iconUrl, colorCode, displayOrder, isFreeTrial, createdBy }) {
        const result = await db.query(`
            INSERT INTO subjects (track_id, name, description, icon_url, color_code, display_order, is_free_trial, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [trackId, name, description, iconUrl, colorCode, displayOrder, isFreeTrial || false, createdBy]);

        return result.rows[0];
    }

    /**
     * Update subject
     */
    static async update(id, { name, description, iconUrl, colorCode, displayOrder, isFreeTrial, isActive }) {
        const result = await db.query(`
            UPDATE subjects
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                icon_url = COALESCE($3, icon_url),
                color_code = COALESCE($4, color_code),
                display_order = COALESCE($5, display_order),
                is_free_trial = COALESCE($6, is_free_trial),
                is_active = COALESCE($7, is_active),
                updated_at = NOW()
            WHERE id = $8
            RETURNING *
        `, [name, description, iconUrl, colorCode, displayOrder, isFreeTrial, isActive, id]);

        return result.rows[0] || null;
    }

    /**
     * Soft delete subject
     */
    static async delete(id) {
        const result = await db.query(`
            UPDATE subjects 
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get subject with topic count
     */
    static async getWithTopicCount(id) {
        const result = await db.query(`
            SELECT s.*, 
                   COUNT(t.id) as topic_count
            FROM subjects s
            LEFT JOIN topics t ON t.subject_id = s.id AND t.is_active = TRUE
            WHERE s.id = $1 AND s.is_active = TRUE
            GROUP BY s.id
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get all subjects (admin)
     */
    static async getAll() {
        const result = await db.query(`
            SELECT s.*, t.name as track_name, t.year_number,
                   COUNT(tp.id) as topic_count
            FROM subjects s
            JOIN tracks t ON t.id = s.track_id
            LEFT JOIN topics tp ON tp.subject_id = s.id AND tp.is_active = TRUE
            WHERE s.is_active = TRUE
            GROUP BY s.id, t.name, t.year_number
            ORDER BY t.year_number ASC, s.display_order ASC
        `);

        return result.rows;
    }
}

module.exports = SubjectModel;
