const db = require('../database/connection');

class MCQModel {
    /**
     * Get all MCQs for a topic
     */
    static async getByTopic(topicId) {
        const result = await db.query(`
            SELECT id, topic_id, question, option_a, option_b, option_c, option_d, 
                   difficulty, display_order, created_at
            FROM mcqs 
            WHERE topic_id = $1 AND is_active = TRUE 
            ORDER BY display_order ASC, created_at ASC
        `, [topicId]);

        return result.rows;
    }

    /**
     * Get MCQ by ID (with correct answer - admin only)
     */
    static async findById(id) {
        const result = await db.query(`
            SELECT * FROM mcqs WHERE id = $1 AND is_active = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get MCQ for student (without correct answer initially)
     */
    static async getForStudent(id) {
        const result = await db.query(`
            SELECT id, topic_id, question, option_a, option_b, option_c, option_d, 
                   difficulty, created_at
            FROM mcqs 
            WHERE id = $1 AND is_active = TRUE
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Check answer and return result
     */
    static async checkAnswer(id, userAnswer) {
        const result = await db.query(`
            SELECT correct_answer, explanation FROM mcqs 
            WHERE id = $1 AND is_active = TRUE
        `, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        const mcq = result.rows[0];
        const isCorrect = mcq.correct_answer === userAnswer.toUpperCase();

        return {
            isCorrect,
            correctAnswer: mcq.correct_answer,
            explanation: mcq.explanation
        };
    }

    /**
     * Create new MCQ
     */
    static async create({
        topicId, question, optionA, optionB, optionC, optionD,
        correctAnswer, explanation, difficulty, displayOrder, createdBy
    }) {
        const result = await db.query(`
            INSERT INTO mcqs (
                topic_id, question, option_a, option_b, option_c, option_d, 
                correct_answer, explanation, difficulty, display_order, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            topicId, question, optionA, optionB, optionC, optionD,
            correctAnswer.toUpperCase(), explanation, difficulty || 'moderate',
            displayOrder, createdBy
        ]);

        return result.rows[0];
    }

    /**
     * Bulk create MCQs
     */
    static async bulkCreate(mcqs, createdBy) {
        const created = [];

        for (const mcq of mcqs) {
            const result = await db.query(`
                INSERT INTO mcqs (
                    topic_id, question, option_a, option_b, option_c, option_d, 
                    correct_answer, explanation, difficulty, display_order, created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                mcq.topicId, mcq.question, mcq.optionA, mcq.optionB,
                mcq.optionC, mcq.optionD, mcq.correctAnswer.toUpperCase(),
                mcq.explanation, mcq.difficulty || 'moderate',
                mcq.displayOrder, createdBy
            ]);

            created.push(result.rows[0]);
        }

        return created;
    }

    /**
     * Update MCQ
     */
    static async update(id, {
        question, optionA, optionB, optionC, optionD,
        correctAnswer, explanation, difficulty, displayOrder, isActive
    }) {
        const result = await db.query(`
            UPDATE mcqs
            SET question = COALESCE($1, question),
                option_a = COALESCE($2, option_a),
                option_b = COALESCE($3, option_b),
                option_c = COALESCE($4, option_c),
                option_d = COALESCE($5, option_d),
                correct_answer = COALESCE($6, correct_answer),
                explanation = COALESCE($7, explanation),
                difficulty = COALESCE($8, difficulty),
                display_order = COALESCE($9, display_order),
                is_active = COALESCE($10, is_active),
                updated_at = NOW()
            WHERE id = $11
            RETURNING *
        `, [
            question, optionA, optionB, optionC, optionD,
            correctAnswer ? correctAnswer.toUpperCase() : null,
            explanation, difficulty, displayOrder, isActive, id
        ]);

        return result.rows[0] || null;
    }

    /**
     * Soft delete MCQ
     */
    static async delete(id) {
        const result = await db.query(`
            UPDATE mcqs 
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get MCQ statistics for a topic
     */
    static async getTopicStats(topicId) {
        const result = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy,
                COUNT(CASE WHEN difficulty = 'moderate' THEN 1 END) as moderate,
                COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard
            FROM mcqs 
            WHERE topic_id = $1 AND is_active = TRUE
        `, [topicId]);

        return result.rows[0];
    }

    /**
     * Get all MCQs (admin)
     */
    static async getAll({ topicId, difficulty, limit = 100, offset = 0 }) {
        let query = `
            SELECT m.*, t.title as topic_title, s.name as subject_name
            FROM mcqs m
            JOIN topics t ON t.id = m.topic_id
            JOIN subjects s ON s.id = t.subject_id
            WHERE m.is_active = TRUE
        `;
        const params = [];
        let paramCount = 1;

        if (topicId) {
            query += ` AND m.topic_id = $${paramCount}`;
            params.push(topicId);
            paramCount++;
        }

        if (difficulty) {
            query += ` AND m.difficulty = $${paramCount}`;
            params.push(difficulty);
            paramCount++;
        }

        query += ` ORDER BY m.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }
}

module.exports = MCQModel;
