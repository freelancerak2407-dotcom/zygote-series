const db = require('../database/connection');

class TrackModel {
    /**
     * Get all active tracks
     */
    static async getAll() {
        const result = await db.query(`
            SELECT * FROM tracks 
            WHERE is_active = TRUE 
            ORDER BY display_order ASC, year_number ASC
        `);

        return result.rows;
    }

    /**
     * Get track by ID
     */
    static async findById(id) {
        const result = await db.query(`
            SELECT * FROM tracks WHERE id = $1 AND is_active = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Create new track
     */
    static async create({ name, description, yearNumber, displayOrder, createdBy }) {
        const result = await db.query(`
            INSERT INTO tracks (name, description, year_number, display_order, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [name, description, yearNumber, displayOrder, createdBy]);

        return result.rows[0];
    }

    /**
     * Update track
     */
    static async update(id, { name, description, yearNumber, displayOrder, isActive }) {
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

        return result.rows[0] || null;
    }

    /**
     * Soft delete track
     */
    static async delete(id) {
        const result = await db.query(`
            UPDATE tracks 
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get track with subject count
     */
    static async getWithSubjectCount(id) {
        const result = await db.query(`
            SELECT t.*, 
                   COUNT(s.id) as subject_count
            FROM tracks t
            LEFT JOIN subjects s ON s.track_id = t.id AND s.is_active = TRUE
            WHERE t.id = $1 AND t.is_active = TRUE
            GROUP BY t.id
        `, [id]);

        return result.rows[0] || null;
    }
}

module.exports = TrackModel;
