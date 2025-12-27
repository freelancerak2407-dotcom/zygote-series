import api from './api';
import API_CONFIG from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthService = {
    // Register new user
    async register(email, password, fullName) {
        try {
            const response = await api.post(API_CONFIG.AUTH.REGISTER, {
                email,
                password,
                fullName,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Login
    async login(email, password) {
        try {
            const response = await api.post(API_CONFIG.AUTH.LOGIN, {
                email,
                password,
            });

            if (response.success && response.data) {
                // Store token and user data
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

                if (response.data.refreshToken) {
                    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    // Verify OTP
    async verifyOTP(email, otpCode) {
        try {
            const response = await api.post(API_CONFIG.AUTH.VERIFY_OTP, {
                email,
                otpCode,
            });

            if (response.success && response.data) {
                // Store token and user data
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

                if (response.data.refreshToken) {
                    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    // Resend OTP
    async resendOTP(email) {
        try {
            const response = await api.post(API_CONFIG.AUTH.RESEND_OTP, {
                email,
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const response = await api.get(API_CONFIG.AUTH.ME);

            if (response.success && response.data) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    async logout() {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            await api.post(API_CONFIG.AUTH.LOGOUT, {
                refreshToken,
            });

            // Clear all stored data
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);

            return { success: true };
        } catch (error) {
            // Clear data even if API call fails
            await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
            throw error;
        }
    },

    // Check if user is authenticated
    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return !!token;
        } catch (error) {
            return false;
        }
    },

    // Get stored user data
    async getStoredUser() {
        try {
            const userStr = await AsyncStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            return null;
        }
    },
};

export default AuthService;
