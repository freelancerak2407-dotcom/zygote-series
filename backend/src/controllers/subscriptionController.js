const SubscriptionModel = require('../models/SubscriptionModel');
const emailService = require('../services/emailService');

class SubscriptionController {
    /**
     * Get subscription plans
     */
    async getPlans(req, res) {
        try {
            // Hardcoded plans (can be moved to database later)
            const plans = [
                {
                    id: '6_months',
                    name: '6 Months Plan',
                    duration: 6,
                    price: 2999, // In cents (₹29.99)
                    currency: 'INR',
                    features: [
                        'Access to all subjects',
                        'Unlimited MCQ practice',
                        'Notes and summaries',
                        'Mind maps',
                        'Progress tracking',
                    ],
                },
                {
                    id: '12_months',
                    name: '12 Months Plan',
                    duration: 12,
                    price: 4999, // In cents (₹49.99)
                    currency: 'INR',
                    popular: true,
                    features: [
                        'Everything in 6 months plan',
                        'Priority support',
                        'Early access to new content',
                    ],
                },
                {
                    id: '24_months',
                    name: '24 Months Plan',
                    duration: 24,
                    price: 7999, // In cents (₹79.99)
                    currency: 'INR',
                    features: [
                        'Everything in 12 months plan',
                        'Lifetime updates',
                        'Dedicated support',
                    ],
                },
            ];

            res.json({
                success: true,
                data: plans,
            });
        } catch (error) {
            console.error('Get plans error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subscription plans',
            });
        }
    }

    /**
     * Get user's active subscription
     */
    async getActiveSubscription(req, res) {
        try {
            const subscription = await SubscriptionModel.getActiveByUser(req.user.id);

            res.json({
                success: true,
                data: subscription,
            });
        } catch (error) {
            console.error('Get subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subscription',
            });
        }
    }

    /**
     * Get subscription history
     */
    async getSubscriptionHistory(req, res) {
        try {
            const subscriptions = await SubscriptionModel.getByUser(req.user.id);

            res.json({
                success: true,
                data: subscriptions,
            });
        } catch (error) {
            console.error('Get subscription history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subscription history',
            });
        }
    }

    /**
     * Create subscription (PLACEHOLDER - Stripe integration deferred)
     */
    async createSubscription(req, res) {
        try {
            const { planType } = req.body;

            // PLACEHOLDER: This is a mock implementation
            // Real Stripe integration will be added later

            const startDate = new Date();
            const months = parseInt(planType.split('_')[0]);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + months);

            const subscription = await SubscriptionModel.create({
                userId: req.user.id,
                stripeCustomerId: 'mock_customer_id',
                stripeSubscriptionId: 'mock_subscription_id',
                planType,
                startDate,
                endDate,
                autoRenew: true,
            });

            // Send confirmation email
            const user = await require('../models/UserModel').findById(req.user.id);
            await emailService.sendSubscriptionConfirmation(
                user.email,
                user.full_name,
                planType,
                endDate
            );

            res.status(201).json({
                success: true,
                message: 'Subscription created successfully (MOCK - Payment integration pending)',
                data: subscription,
            });
        } catch (error) {
            console.error('Create subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create subscription',
            });
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(req, res) {
        try {
            const subscription = await SubscriptionModel.getActiveByUser(req.user.id);

            if (!subscription) {
                return res.status(404).json({
                    success: false,
                    message: 'No active subscription found',
                });
            }

            await SubscriptionModel.cancel(subscription.id);

            res.json({
                success: true,
                message: 'Subscription cancelled successfully',
            });
        } catch (error) {
            console.error('Cancel subscription error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel subscription',
            });
        }
    }

    /**
     * Get all subscriptions (Admin)
     */
    async getAllSubscriptions(req, res) {
        try {
            const { status, planType, limit, offset } = req.query;

            const subscriptions = await SubscriptionModel.getAll({
                status,
                planType,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
            });

            res.json({
                success: true,
                data: subscriptions,
            });
        } catch (error) {
            console.error('Get all subscriptions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subscriptions',
            });
        }
    }

    /**
     * Get subscription statistics (Admin)
     */
    async getSubscriptionStats(req, res) {
        try {
            const stats = await SubscriptionModel.getStats();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            console.error('Get subscription stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subscription statistics',
            });
        }
    }

    /**
     * Get payment history
     */
    async getPaymentHistory(req, res) {
        try {
            const payments = await SubscriptionModel.getPaymentHistory(req.user.id);

            res.json({
                success: true,
                data: payments,
            });
        } catch (error) {
            console.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payment history',
            });
        }
    }
}

module.exports = new SubscriptionController();
