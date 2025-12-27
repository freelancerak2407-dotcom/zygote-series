import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // Token expired
            if (status === 401 && data.code === 'TOKEN_EXPIRED') {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }

            return Promise.reject({
                message: data.message || 'An error occurred',
                status,
                data,
            });
        } else if (error.request) {
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 0,
            });
        } else {
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: -1,
            });
        }
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
    getCurrentUser: () => api.get('/auth/me'),
};

// Tracks API
export const tracksAPI = {
    getAll: () => api.get('/tracks'),
    create: (data) => api.post('/admin/tracks', data),
    update: (id, data) => api.put(`/admin/tracks/${id}`, data),
    delete: (id) => api.delete(`/admin/tracks/${id}`),
};

// Subjects API
export const subjectsAPI = {
    getByTrack: (trackId) => api.get(`/tracks/${trackId}/subjects`),
    create: (data) => api.post('/admin/subjects', data),
    update: (id, data) => api.put(`/admin/subjects/${id}`, data),
    delete: (id) => api.delete(`/admin/subjects/${id}`),
};

// Topics API
export const topicsAPI = {
    getBySubject: (subjectId) => api.get(`/subjects/${subjectId}/topics`),
    get: (id) => api.get(`/topics/${id}`),
    create: (data) => api.post('/admin/topics', data),
    update: (id, data) => api.put(`/admin/topics/${id}`, data),
    delete: (id) => api.delete(`/admin/topics/${id}`),
};

// Content API
export const contentAPI = {
    createNotes: (topicId, data) => api.post(`/admin/topics/${topicId}/notes`, data),
    createSummary: (topicId, data) => api.post(`/admin/topics/${topicId}/summary`, data),
    createMindMap: (topicId, data) => api.post(`/admin/topics/${topicId}/mindmap`, data),
};

// MCQs API
export const mcqsAPI = {
    getByTopic: (topicId) => api.get(`/topics/${topicId}/mcqs`),
    create: (data) => api.post('/admin/mcqs', data),
    bulkCreate: (mcqs) => api.post('/admin/mcqs/bulk', { mcqs }),
    update: (id, data) => api.put(`/admin/mcqs/${id}`, data),
    delete: (id) => api.delete(`/admin/mcqs/${id}`),
};

export default api;
