const UserModel = require('../models/UserModel');
const AnalyticsModel = require('../models/AnalyticsModel');
const SubscriptionModel = require('../models/SubscriptionModel');
const uploadService = require('../services/uploadService');

class UserController {
    /**
     * Get user profile
     */
    async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Get subscription status
            const hasSubscription = await SubscriptionModel.hasActiveSubscription(user.id);
            const subscription = await SubscriptionModel.getActiveByUser(user.id);

            // Get user stats
            const stats = await AnalyticsModel.getUserStats(user.id);

            res.json({
                success: true,
                data: {
                    ...user,
                    hasSubscription,
                    subscription,
                    stats,
                },
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile',
            });
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(req, res) {
        try {
            const { fullName } = req.body;

            const user = await UserModel.updateProfile(req.user.id, {
                fullName,
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
            });
        }
    }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
            }

            // Upload to S3
            const result = await uploadService.uploadProfilePicture(req.file);

            // Update user profile
            const user = await UserModel.updateProfile(req.user.id, {
                profilePicture: result.url,
            });

            res.json({
                success: true,
                message: 'Profile picture uploaded successfully',
                data: {
                    profilePicture: result.url,
                },
            });
        } catch (error) {
            console.error('Upload profile picture error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload profile picture',
            });
        }
    }

    /**
     * Get user bookmarks
     */
    async getBookmarks(req, res) {
        try {
            const bookmarks = await AnalyticsModel.getUserBookmarks(req.user.id);

            res.json({
                success: true,
                data: bookmarks,
            });
        } catch (error) {
            console.error('Get bookmarks error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch bookmarks',
            });
        }
    }

    /**
     * Add bookmark
     */
    async addBookmark(req, res) {
        try {
            const { topicId } = req.params;

            await AnalyticsModel.addBookmark(req.user.id, topicId);

            res.json({
                success: true,
                message: 'Bookmark added successfully',
            });
        } catch (error) {
            console.error('Add bookmark error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add bookmark',
            });
        }
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(req, res) {
        try {
            const { topicId } = req.params;

            await AnalyticsModel.removeBookmark(req.user.id, topicId);

            res.json({
                success: true,
                message: 'Bookmark removed successfully',
            });
        } catch (error) {
            console.error('Remove bookmark error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove bookmark',
            });
        }
    }

    /**
     * Get user activity
     */
    async getActivity(req, res) {
        try {
            const { limit } = req.query;
            const activity = await AnalyticsModel.getUserRecentActivity(
                req.user.id,
                parseInt(limit) || 20
            );

            res.json({
                success: true,
                data: activity,
            });
        } catch (error) {
            console.error('Get activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch activity',
            });
        }
    }

    /**
     * Get all users (Admin)
     */
    async getAllUsers(req, res) {
        try {
            const { role, isVerified, limit, offset } = req.query;

            const users = await UserModel.getAll({
                role,
                isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
            });

            res.json({
                success: true,
                data: users,
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
            });
        }
    }

    /**
     * Deactivate user (Admin)
     */
    async deactivateUser(req, res) {
        try {
            const { id } = req.params;

            const user = await UserModel.deactivate(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            // Log activity
            await AnalyticsModel.logAdminActivity({
                userId: req.user.id,
                action: 'USER_DEACTIVATED',
                entityType: 'user',
                entityId: id,
            });

            res.json({
                success: true,
                message: 'User deactivated successfully',
            });
        } catch (error) {
            console.error('Deactivate user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to deactivate user',
            });
        }
    }
}

module.exports = new UserController();
