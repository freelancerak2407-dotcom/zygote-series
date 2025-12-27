// API Configuration
const API_URL = 'http://localhost:5000/api';

// You can change this to your production URL
// const API_URL = process.env.API_URL || 'http://localhost:5000/api';

export default {
    API_URL,

    // Endpoints
    AUTH: {
        REGISTER: `${API_URL}/auth/register`,
        LOGIN: `${API_URL}/auth/login`,
        VERIFY_OTP: `${API_URL}/auth/verify-otp`,
        RESEND_OTP: `${API_URL}/auth/resend-otp`,
        ME: `${API_URL}/auth/me`,
        LOGOUT: `${API_URL}/auth/logout`,
    },

    TRACKS: {
        LIST: `${API_URL}/tracks`,
        GET: (id) => `${API_URL}/tracks/${id}`,
        SUBJECTS: (id) => `${API_URL}/tracks/${id}/subjects`,
    },

    SUBJECTS: {
        GET: (id) => `${API_URL}/subjects/${id}`,
        TOPICS: (id) => `${API_URL}/subjects/${id}/topics`,
    },

    TOPICS: {
        GET: (id) => `${API_URL}/topics/${id}`,
        NOTES: (id) => `${API_URL}/topics/${id}/notes`,
        SUMMARY: (id) => `${API_URL}/topics/${id}/summary`,
        MINDMAP: (id) => `${API_URL}/topics/${id}/mindmap`,
        MCQS: (id) => `${API_URL}/topics/${id}/mcqs`,
        SUBMIT_MCQ: (topicId, mcqId) => `${API_URL}/topics/${topicId}/mcqs/${mcqId}/submit`,
    },

    USERS: {
        PREFERENCES: `${API_URL}/users/preferences`,
        BOOKMARKS: `${API_URL}/users/bookmarks`,
        ADD_BOOKMARK: `${API_URL}/users/bookmarks`,
        REMOVE_BOOKMARK: (topicId) => `${API_URL}/users/bookmarks/${topicId}`,
        ANALYTICS: `${API_URL}/users/analytics`,
    },

    SUBSCRIPTIONS: {
        PLANS: `${API_URL}/subscriptions/plans`,
        MY_SUBSCRIPTION: `${API_URL}/subscriptions/my-subscription`,
        CREATE: `${API_URL}/subscriptions/create`,
        CANCEL: `${API_URL}/subscriptions/cancel`,
    },
};
