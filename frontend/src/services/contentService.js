import api from './api';
import API_CONFIG from '../config/api';

const ContentService = {
    // Get all tracks
    async getTracks() {
        try {
            const response = await api.get(API_CONFIG.TRACKS.LIST);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get track by ID
    async getTrack(trackId) {
        try {
            const response = await api.get(API_CONFIG.TRACKS.GET(trackId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get subjects by track
    async getSubjectsByTrack(trackId) {
        try {
            const response = await api.get(API_CONFIG.TRACKS.SUBJECTS(trackId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get subject by ID
    async getSubject(subjectId) {
        try {
            const response = await api.get(API_CONFIG.SUBJECTS.GET(subjectId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get topics by subject
    async getTopicsBySubject(subjectId) {
        try {
            const response = await api.get(API_CONFIG.SUBJECTS.TOPICS(subjectId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get topic by ID
    async getTopic(topicId) {
        try {
            const response = await api.get(API_CONFIG.TOPICS.GET(topicId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get notes for topic
    async getNotes(topicId) {
        try {
            const response = await api.get(API_CONFIG.TOPICS.NOTES(topicId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get summary for topic
    async getSummary(topicId) {
        try {
            const response = await api.get(API_CONFIG.TOPICS.SUMMARY(topicId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get mind map for topic
    async getMindMap(topicId) {
        try {
            const response = await api.get(API_CONFIG.TOPICS.MINDMAP(topicId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get MCQs for topic
    async getMCQs(topicId, difficulty = null, limit = 20) {
        try {
            const params = { limit };
            if (difficulty) {
                params.difficulty = difficulty;
            }

            const response = await api.get(API_CONFIG.TOPICS.MCQS(topicId), { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Submit MCQ answer
    async submitMCQAnswer(topicId, mcqId, selectedAnswer, timeSpent = 0) {
        try {
            const response = await api.post(API_CONFIG.TOPICS.SUBMIT_MCQ(topicId, mcqId), {
                selectedAnswer,
                timeSpent,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default ContentService;
