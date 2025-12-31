const db = require('../database/connection');

class AnalyticsModel {
    /**
     * Track user activity
     */
    static async trackActivity({ userId, topicId, activityType, timeSpentSeconds, quizScorePercentage }) {
        const result = await db.query(`
            INSERT INTO analytics (user_id, topic_id, activity_type, time_spent_seconds, quiz_score_percentage)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, topicId, activityType, timeSpentSeconds || 0, quizScorePercentage]);

        return result.rows[0];
    }

    /**
     * Get user's activity for a topic
     */
    static async getUserTopicActivity(userId, topicId) {
        const result = await db.query(`
            SELECT * FROM analytics 
            WHERE user_id = $1 AND topic_id = $2 
            ORDER BY created_at DESC
        `, [userId, topicId]);

        return result.rows;
    }

    /**
     * Get user's overall statistics
     */
    static async getUserStats(userId) {
        const result = await db.query(`
            SELECT 
                COUNT(DISTINCT topic_id) as topics_accessed,
                COUNT(CASE WHEN activity_type = 'completed' THEN 1 END) as topics_completed,
                COUNT(CASE WHEN activity_type = 'quiz_attempted' THEN 1 END) as quizzes_attempted,
                SUM(time_spent_seconds) as total_time_spent,
                AVG(CASE WHEN quiz_score_percentage IS NOT NULL THEN quiz_score_percentage END) as avg_quiz_score
            FROM analytics 
            WHERE user_id = $1
        `, [userId]);

        return result.rows[0];
    }

    /**
     * Get user's recent activity
     */
    static async getUserRecentActivity(userId, limit = 20) {
        const result = await db.query(`
            SELECT a.*, t.title as topic_title, s.name as subject_name
            FROM analytics a
            JOIN topics t ON t.id = a.topic_id
            JOIN subjects s ON s.id = t.subject_id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
            LIMIT $2
        `, [userId, limit]);

        return result.rows;
    }

    /**
     * Get topic statistics (admin)
     */
    static async getTopicStats(topicId) {
        const result = await db.query(`
            SELECT 
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(CASE WHEN activity_type = 'opened' THEN 1 END) as opens,
                COUNT(CASE WHEN activity_type = 'completed' THEN 1 END) as completions,
                COUNT(CASE WHEN activity_type = 'quiz_attempted' THEN 1 END) as quiz_attempts,
                AVG(time_spent_seconds) as avg_time_spent,
                AVG(CASE WHEN quiz_score_percentage IS NOT NULL THEN quiz_score_percentage END) as avg_quiz_score
            FROM analytics 
            WHERE topic_id = $1
        `, [topicId]);

        return result.rows[0];
    }

    /**
     * Get platform-wide statistics (admin)
     */
    static async getPlatformStats() {
        const result = await db.query(`
            SELECT 
                COUNT(DISTINCT user_id) as active_users,
                COUNT(DISTINCT topic_id) as accessed_topics,
                COUNT(*) as total_activities,
                SUM(time_spent_seconds) as total_time_spent,
                AVG(CASE WHEN quiz_score_percentage IS NOT NULL THEN quiz_score_percentage END) as platform_avg_score
            FROM analytics
        `);

        return result.rows[0];
    }

    /**
     * Get daily active users (last 30 days)
     */
    static async getDailyActiveUsers(days = 30) {
        const result = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(DISTINCT user_id) as active_users
            FROM analytics
            WHERE created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        return result.rows;
    }

    /**
     * Get most popular topics
     */
    static async getPopularTopics(limit = 10) {
        const result = await db.query(`
            SELECT 
                t.id, t.title, s.name as subject_name,
                COUNT(DISTINCT a.user_id) as unique_users,
                COUNT(*) as total_views
            FROM analytics a
            JOIN topics t ON t.id = a.topic_id
            JOIN subjects s ON s.id = t.subject_id
            WHERE a.activity_type = 'opened'
            GROUP BY t.id, t.title, s.name
            ORDER BY total_views DESC
            LIMIT $1
        `, [limit]);

        return result.rows;
    }

    /**
     * Log admin activity
     */
    static async logAdminActivity({ userId, action, entityType, entityId, details, ipAddress, userAgent }) {
        const result = await db.query(`
            INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress, userAgent]);

        return result.rows[0];
    }

    /**
     * Get admin activity logs
     */
    static async getAdminLogs({ userId, action, entityType, limit = 100, offset = 0 }) {
        let query = `
            SELECT al.*, u.email, u.full_name
            FROM activity_logs al
            LEFT JOIN users u ON u.id = al.user_id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (userId) {
            query += ` AND al.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        if (action) {
            query += ` AND al.action = $${paramCount}`;
            params.push(action);
            paramCount++;
        }

        if (entityType) {
            query += ` AND al.entity_type = $${paramCount}`;
            params.push(entityType);
            paramCount++;
        }

        query += ` ORDER BY al.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Add bookmark
     */
    static async addBookmark(userId, topicId) {
        try {
            const result = await db.query(`
                INSERT INTO bookmarks (user_id, topic_id)
                VALUES ($1, $2)
                ON CONFLICT (user_id, topic_id) DO NOTHING
                RETURNING *
            `, [userId, topicId]);

            return result.rows[0] || { userId, topicId };
        } catch (error) {
            // Handle unique constraint violation gracefully
            return { userId, topicId };
        }
    }

    /**
     * Remove bookmark
     */
    static async removeBookmark(userId, topicId) {
        const result = await db.query(`
            DELETE FROM bookmarks 
            WHERE user_id = $1 AND topic_id = $2
            RETURNING *
        `, [userId, topicId]);

        return result.rows[0] || null;
    }

    /**
     * Get user's bookmarks
     */
    static async getUserBookmarks(userId) {
        const result = await db.query(`
            SELECT b.*, t.title, t.description, s.name as subject_name, s.color_code
            FROM bookmarks b
            JOIN topics t ON t.id = b.topic_id
            JOIN subjects s ON s.id = t.subject_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [userId]);

        return result.rows;
    }

    /**
     * Check if topic is bookmarked
     */
    static async isBookmarked(userId, topicId) {
        const result = await db.query(`
            SELECT EXISTS(
                SELECT 1 FROM bookmarks 
                WHERE user_id = $1 AND topic_id = $2
            ) as is_bookmarked
        `, [userId, topicId]);

        return result.rows[0].is_bookmarked;
    }
}

module.exports = AnalyticsModel;
