const MCQModel = require('../models/MCQModel');
const AnalyticsModel = require('../models/AnalyticsModel');

class MCQController {
    /**
     * Get MCQs for a topic
     */
    async getMCQsByTopic(req, res) {
        try {
            const { topicId } = req.params;
            const mcqs = await MCQModel.getByTopic(topicId);

            res.json({
                success: true,
                data: mcqs,
            });
        } catch (error) {
            console.error('Get MCQs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch MCQs',
            });
        }
    }

    /**
     * Get single MCQ (for students - no correct answer)
     */
    async getMCQById(req, res) {
        try {
            const { id } = req.params;
            const mcq = await MCQModel.getForStudent(id);

            if (!mcq) {
                return res.status(404).json({
                    success: false,
                    message: 'MCQ not found',
                });
            }

            res.json({
                success: true,
                data: mcq,
            });
        } catch (error) {
            console.error('Get MCQ error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch MCQ',
            });
        }
    }

    /**
     * Check MCQ answer
     */
    async checkAnswer(req, res) {
        try {
            const { id } = req.params;
            const { answer } = req.body;

            const result = await MCQModel.checkAnswer(id, answer);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'MCQ not found',
                });
            }

            // Track analytics
            if (req.user) {
                const mcq = await MCQModel.findById(id);
                await AnalyticsModel.trackActivity({
                    userId: req.user.id,
                    topicId: mcq.topic_id,
                    activityType: 'quiz_attempted',
                    quizScorePercentage: result.isCorrect ? 100 : 0,
                });
            }

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error('Check answer error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check answer',
            });
        }
    }

    /**
     * Create MCQ (Admin)
     */
    async createMCQ(req, res) {
        try {
            const mcqData = req.body;

            const mcq = await MCQModel.create({
                ...mcqData,
                createdBy: req.user.id,
            });

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'MCQ_CREATED',
                entityType: 'mcq',
                entityId: mcq.id,
            });

            res.status(201).json({
                success: true,
                message: 'MCQ created successfully',
                data: mcq,
            });
        } catch (error) {
            console.error('Create MCQ error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create MCQ',
            });
        }
    }

    /**
     * Bulk create MCQs (Admin)
     */
    async bulkCreateMCQs(req, res) {
        try {
            const { mcqs } = req.body;

            const created = await MCQModel.bulkCreate(mcqs, req.user.id);

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'MCQ_BULK_CREATED',
                entityType: 'mcq',
                details: { count: created.length },
            });

            res.status(201).json({
                success: true,
                message: `${created.length} MCQs created successfully`,
                data: created,
            });
        } catch (error) {
            console.error('Bulk create MCQs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create MCQs',
            });
        }
    }

    /**
     * Update MCQ (Admin)
     */
    async updateMCQ(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const mcq = await MCQModel.update(id, updates);

            if (!mcq) {
                return res.status(404).json({
                    success: false,
                    message: 'MCQ not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'MCQ_UPDATED',
                entityType: 'mcq',
                entityId: id,
            });

            res.json({
                success: true,
                message: 'MCQ updated successfully',
                data: mcq,
            });
        } catch (error) {
            console.error('Update MCQ error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update MCQ',
            });
        }
    }

    /**
     * Delete MCQ (Admin)
     */
    async deleteMCQ(req, res) {
        try {
            const { id } = req.params;

            const mcq = await MCQModel.delete(id);

            if (!mcq) {
                return res.status(404).json({
                    success: false,
                    message: 'MCQ not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'MCQ_DELETED',
                entityType: 'mcq',
                entityId: id,
            });

            res.json({
                success: true,
                message: 'MCQ deleted successfully',
            });
        } catch (error) {
            console.error('Delete MCQ error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete MCQ',
            });
        }
    }

    /**
     * Get MCQ statistics for a topic (Admin)
     */
    async getTopicStats(req, res) {
        try {
            const { topicId } = req.params;
            const stats = await MCQModel.getTopicStats(topicId);

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Get MCQ stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
            });
        }
    }

    /**
     * Get all MCQs (Admin)
     */
    async getAllMCQs(req, res) {
        try {
            const { topicId, difficulty, limit, offset } = req.query;

            const mcqs = await MCQModel.getAll({
                topicId,
                difficulty,
                limit: parseInt(limit) || 100,
                offset: parseInt(offset) || 0,
            });

            res.json({
                success: true,
                data: mcqs,
            });
        } catch (error) {
            console.error('Get all MCQs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch MCQs',
            });
        }
    }
}

module.exports = new MCQController();
