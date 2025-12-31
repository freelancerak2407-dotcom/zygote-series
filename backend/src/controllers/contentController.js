const TrackModel = require('../models/TrackModel');
const SubjectModel = require('../models/SubjectModel');
const TopicModel = require('../models/TopicModel');
const AnalyticsModel = require('../models/AnalyticsModel');

class ContentController {
    // ==================== TRACKS ====================

    /**
     * Get all tracks
     */
    async getAllTracks(req, res) {
        try {
            const tracks = await TrackModel.getAll();

            res.json({
                success: true,
                data: tracks,
            });
        } catch (error) {
            console.error('Get tracks error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tracks',
            });
        }
    }

    /**
     * Get track by ID
     */
    async getTrackById(req, res) {
        try {
            const { id } = req.params;
            const track = await TrackModel.getWithSubjectCount(id);

            if (!track) {
                return res.status(404).json({
                    success: false,
                    message: 'Track not found',
                });
            }

            res.json({
                success: true,
                data: track,
            });
        } catch (error) {
            console.error('Get track error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch track',
            });
        }
    }

    /**
     * Create track (Admin)
     */
    async createTrack(req, res) {
        try {
            const { name, description, yearNumber, displayOrder } = req.body;

            const track = await TrackModel.create({
                name,
                description,
                yearNumber,
                displayOrder,
                createdBy: req.user.id,
            });

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'TRACK_CREATED',
                entityType: 'track',
                entityId: track.id,
                details: { name },
            });

            res.status(201).json({
                success: true,
                message: 'Track created successfully',
                data: track,
            });
        } catch (error) {
            console.error('Create track error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create track',
            });
        }
    }

    /**
     * Update track (Admin)
     */
    async updateTrack(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const track = await TrackModel.update(id, updates);

            if (!track) {
                return res.status(404).json({
                    success: false,
                    message: 'Track not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'TRACK_UPDATED',
                entityType: 'track',
                entityId: id,
                details: updates,
            });

            res.json({
                success: true,
                message: 'Track updated successfully',
                data: track,
            });
        } catch (error) {
            console.error('Update track error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update track',
            });
        }
    }

    /**
     * Delete track (Admin)
     */
    async deleteTrack(req, res) {
        try {
            const { id } = req.params;

            const track = await TrackModel.delete(id);

            if (!track) {
                return res.status(404).json({
                    success: false,
                    message: 'Track not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'TRACK_DELETED',
                entityType: 'track',
                entityId: id,
            });

            res.json({
                success: true,
                message: 'Track deleted successfully',
            });
        } catch (error) {
            console.error('Delete track error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete track',
            });
        }
    }

    // ==================== SUBJECTS ====================

    /**
     * Get subjects by track
     */
    async getSubjectsByTrack(req, res) {
        try {
            const { trackId } = req.params;
            const subjects = await SubjectModel.getByTrack(trackId);

            res.json({
                success: true,
                data: subjects,
            });
        } catch (error) {
            console.error('Get subjects error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subjects',
            });
        }
    }

    /**
     * Get subject by ID
     */
    async getSubjectById(req, res) {
        try {
            const { id } = req.params;
            const subject = await SubjectModel.getWithTopicCount(id);

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found',
                });
            }

            res.json({
                success: true,
                data: subject,
            });
        } catch (error) {
            console.error('Get subject error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subject',
            });
        }
    }

    /**
     * Get all subjects (Admin)
     */
    async getAllSubjects(req, res) {
        try {
            const subjects = await SubjectModel.getAll();

            res.json({
                success: true,
                data: subjects,
            });
        } catch (error) {
            console.error('Get all subjects error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subjects',
            });
        }
    }

    /**
     * Create subject (Admin)
     */
    async createSubject(req, res) {
        try {
            const { trackId, name, description, iconUrl, colorCode, displayOrder, isFreeTrial } = req.body;

            const subject = await SubjectModel.create({
                trackId,
                name,
                description,
                iconUrl,
                colorCode,
                displayOrder,
                isFreeTrial,
                createdBy: req.user.id,
            });

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'SUBJECT_CREATED',
                entityType: 'subject',
                entityId: subject.id,
                details: { name },
            });

            res.status(201).json({
                success: true,
                message: 'Subject created successfully',
                data: subject,
            });
        } catch (error) {
            console.error('Create subject error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create subject',
            });
        }
    }

    /**
     * Update subject (Admin)
     */
    async updateSubject(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const subject = await SubjectModel.update(id, updates);

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'SUBJECT_UPDATED',
                entityType: 'subject',
                entityId: id,
                details: updates,
            });

            res.json({
                success: true,
                message: 'Subject updated successfully',
                data: subject,
            });
        } catch (error) {
            console.error('Update subject error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update subject',
            });
        }
    }

    /**
     * Delete subject (Admin)
     */
    async deleteSubject(req, res) {
        try {
            const { id } = req.params;

            const subject = await SubjectModel.delete(id);

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'SUBJECT_DELETED',
                entityType: 'subject',
                entityId: id,
            });

            res.json({
                success: true,
                message: 'Subject deleted successfully',
            });
        } catch (error) {
            console.error('Delete subject error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete subject',
            });
        }
    }

    // ==================== TOPICS ====================

    /**
     * Get topics by subject
     */
    async getTopicsBySubject(req, res) {
        try {
            const { subjectId } = req.params;
            const topics = await TopicModel.getBySubject(subjectId);

            res.json({
                success: true,
                data: topics,
            });
        } catch (error) {
            console.error('Get topics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch topics',
            });
        }
    }

    /**
     * Get topic by ID with all content
     */
    async getTopicById(req, res) {
        try {
            const { id } = req.params;
            const topic = await TopicModel.getWithContent(id);

            if (!topic) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic not found',
                });
            }

            // Track analytics
            if (req.user) {
                await AnalyticsModel.trackActivity({
                    userId: req.user.id,
                    topicId: id,
                    activityType: 'opened',
                });
            }

            res.json({
                success: true,
                data: topic,
            });
        } catch (error) {
            console.error('Get topic error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch topic',
            });
        }
    }

    /**
     * Get all topics (Admin)
     */
    async getAllTopics(req, res) {
        try {
            const { limit, offset } = req.query;
            const topics = await TopicModel.getAll({
                limit: parseInt(limit) || 100,
                offset: parseInt(offset) || 0,
            });

            res.json({
                success: true,
                data: topics,
            });
        } catch (error) {
            console.error('Get all topics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch topics',
            });
        }
    }

    /**
     * Create topic (Admin)
     */
    async createTopic(req, res) {
        try {
            const { subjectId, title, description, displayOrder, isFreeSample } = req.body;

            const topic = await TopicModel.create({
                subjectId,
                title,
                description,
                displayOrder,
                isFreeSample,
                createdBy: req.user.id,
            });

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'TOPIC_CREATED',
                entityType: 'topic',
                entityId: topic.id,
                details: { title },
            });

            res.status(201).json({
                success: true,
                message: 'Topic created successfully',
                data: topic,
            });
        } catch (error) {
            console.error('Create topic error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create topic',
            });
        }
    }

    /**
     * Update topic (Admin)
     */
    async updateTopic(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const topic = await TopicModel.update(id, updates);

            if (!topic) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'TOPIC_UPDATED',
                entityType: 'topic',
                entityId: id,
                details: updates,
            });

            res.json({
                success: true,
                message: 'Topic updated successfully',
                data: topic,
            });
        } catch (error) {
            console.error('Update topic error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update topic',
            });
        }
    }

    /**
     * Delete topic (Admin)
     */
    async deleteTopic(req, res) {
        try {
            const { id } = req.params;

            const topic = await TopicModel.delete(id);

            if (!topic) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'TOPIC_DELETED',
                entityType: 'topic',
                entityId: id,
            });

            res.json({
                success: true,
                message: 'Topic deleted successfully',
            });
        } catch (error) {
            console.error('Delete topic error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete topic',
            });
        }
    }

    // ==================== TOPIC CONTENT ====================

    /**
     * Create/Update notes (Admin)
     */
    async createNotes(req, res) {
        try {
            const { id } = req.params;
            const { content, contentType, pdfUrl } = req.body;

            const notes = await TopicModel.createNotes({
                topicId: id,
                content,
                contentType,
                pdfUrl,
                createdBy: req.user.id,
            });

            res.status(201).json({
                success: true,
                message: 'Notes created successfully',
                data: notes,
            });
        } catch (error) {
            console.error('Create notes error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create notes',
            });
        }
    }

    /**
     * Create/Update summary (Admin)
     */
    async createSummary(req, res) {
        try {
            const { id } = req.params;
            const { content, contentType, pdfUrl } = req.body;

            const summary = await TopicModel.createSummary({
                topicId: id,
                content,
                contentType,
                pdfUrl,
                createdBy: req.user.id,
            });

            res.status(201).json({
                success: true,
                message: 'Summary created successfully',
                data: summary,
            });
        } catch (error) {
            console.error('Create summary error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create summary',
            });
        }
    }

    /**
     * Create/Update mind map (Admin)
     */
    async createMindMap(req, res) {
        try {
            const { id } = req.params;
            const { imageUrl, imageType, thumbnailUrl } = req.body;

            const mindMap = await TopicModel.createMindMap({
                topicId: id,
                imageUrl,
                imageType,
                thumbnailUrl,
                createdBy: req.user.id,
            });

            res.status(201).json({
                success: true,
                message: 'Mind map created successfully',
                data: mindMap,
            });
        } catch (error) {
            console.error('Create mind map error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create mind map',
            });
        }
    }

    /**
     * Get notes for topic
     */
    async getNotes(req, res) {
        try {
            const { id } = req.params;
            const notes = await TopicModel.getNotes(id);

            if (!notes) {
                return res.status(404).json({
                    success: false,
                    message: 'Notes not found',
                });
            }

            res.json({
                success: true,
                data: notes,
            });
        } catch (error) {
            console.error('Get notes error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notes',
            });
        }
    }

    /**
     * Get summary for topic
     */
    async getSummary(req, res) {
        try {
            const { id } = req.params;
            const summary = await TopicModel.getSummary(id);

            if (!summary) {
                return res.status(404).json({
                    success: false,
                    message: 'Summary not found',
                });
            }

            res.json({
                success: true,
                data: summary,
            });
        } catch (error) {
            console.error('Get summary error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch summary',
            });
        }
    }

    /**
     * Get mind map for topic
     */
    async getMindMap(req, res) {
        try {
            const { id } = req.params;
            const mindMap = await TopicModel.getMindMap(id);

            if (!mindMap) {
                return res.status(404).json({
                    success: false,
                    message: 'Mind map not found',
                });
            }

            res.json({
                success: true,
                data: mindMap,
            });
        } catch (error) {
            console.error('Get mind map error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch mind map',
            });
        }
    }
}

module.exports = new ContentController();
