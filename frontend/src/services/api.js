import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api';

// Create axios instance
const api = axios.create({
    baseURL: API_CONFIG.API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
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
    async (error) => {
        if (error.response) {
            // Server responded with error
            const { status, data } = error.response;

            // Token expired
            if (status === 401 && data.code === 'TOKEN_EXPIRED') {
                // Clear token and redirect to login
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
                // You can emit an event here to redirect to login
            }

            return Promise.reject({
                message: data.message || 'An error occurred',
                status,
                data,
            });
        } else if (error.request) {
            // Network error
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

export default api;
