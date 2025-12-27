import api from './api';
import API_CONFIG from '../config/api';

const UserService = {
    // Get user preferences
    async getPreferences() {
        try {
            const response = await api.get(API_CONFIG.USERS.PREFERENCES);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update user preferences
    async updatePreferences(preferences) {
        try {
            const response = await api.put(API_CONFIG.USERS.PREFERENCES, preferences);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get bookmarks
    async getBookmarks() {
        try {
            const response = await api.get(API_CONFIG.USERS.BOOKMARKS);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Add bookmark
    async addBookmark(topicId) {
        try {
            const response = await api.post(API_CONFIG.USERS.ADD_BOOKMARK, {
                topicId,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Remove bookmark
    async removeBookmark(topicId) {
        try {
            const response = await api.delete(API_CONFIG.USERS.REMOVE_BOOKMARK(topicId));
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get user analytics
    async getAnalytics() {
        try {
            const response = await api.get(API_CONFIG.USERS.ANALYTICS);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get subscription
    async getSubscription() {
        try {
            const response = await api.get(API_CONFIG.SUBSCRIPTIONS.MY_SUBSCRIPTION);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get subscription plans
    async getSubscriptionPlans() {
        try {
            const response = await api.get(API_CONFIG.SUBSCRIPTIONS.PLANS);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Create subscription
    async createSubscription(planType) {
        try {
            const response = await api.post(API_CONFIG.SUBSCRIPTIONS.CREATE, {
                planType,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Cancel subscription
    async cancelSubscription() {
        try {
            const response = await api.post(API_CONFIG.SUBSCRIPTIONS.CANCEL);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default UserService;
