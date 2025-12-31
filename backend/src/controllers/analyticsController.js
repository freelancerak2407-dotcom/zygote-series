const AnalyticsModel = require('../models/AnalyticsModel');

class AnalyticsController {
    /**
     * Track user activity
     */
    async trackActivity(req, res) {
        try {
            const { topicId, activityType, timeSpentSeconds, quizScorePercentage } = req.body;

            await AnalyticsModel.trackActivity({
                userId: req.user.id,
                topicId,
                activityType,
                timeSpentSeconds,
                quizScorePercentage,
            });

            res.json({
                success: true,
                message: 'Activity tracked successfully',
            });
        } catch (error) {
            console.error('Track activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to track activity',
            });
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(req, res) {
        try {
            const stats = await AnalyticsModel.getUserStats(req.user.id);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
            });
        }
    }

    /**
     * Get platform statistics (Admin)
     */
    async getPlatformStats(req, res) {
        try {
            const stats = await AnalyticsModel.getPlatformStats();
            const dailyUsers = await AnalyticsModel.getDailyActiveUsers(30);
            const popularTopics = await AnalyticsModel.getPopularTopics(10);

            res.json({
                success: true,
                data: {
                    overview: stats,
                    dailyActiveUsers: dailyUsers,
                    popularTopics,
                },
            });
        } catch (error) {
            console.error('Get platform stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch platform statistics',
            });
        }
    }

    /**
     * Get topic statistics (Admin)
     */
    async getTopicStats(req, res) {
        try {
            const { topicId } = req.params;
            const stats = await AnalyticsModel.getTopicStats(topicId);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Get topic stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch topic statistics',
            });
        }
    }

    /**
     * Get activity logs (Admin)
     */
    async getActivityLogs(req, res) {
        try {
            const { userId, action, entityType, limit, offset } = req.query;

            const logs = await AnalyticsModel.getAdminLogs({
                userId,
                action,
                entityType,
                limit: parseInt(limit) || 100,
                offset: parseInt(offset) || 0,
            });

            res.json({
                success: true,
                data: logs,
            });
        } catch (error) {
            console.error('Get activity logs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch activity logs',
            });
        }
    }
}

module.exports = new AnalyticsController();
