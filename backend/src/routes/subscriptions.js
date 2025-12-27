const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const { verifyToken } = require('../middleware/auth');

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: '6_months',
                name: '6 Months Plan',
                duration: 6,
                durationUnit: 'months',
                price: 2999,
                currency: 'INR',
                features: [
                    'Access to all subjects',
                    'Unlimited MCQs',
                    'Notes & Summaries',
                    'Mind Maps',
                    'Progress tracking'
                ]
            },
            {
                id: '12_months',
                name: '12 Months Plan',
                duration: 12,
                durationUnit: 'months',
                price: 4999,
                currency: 'INR',
                popular: true,
                features: [
                    'All 6-month features',
                    'Priority support',
                    'Early access to new content',
                    'Downloadable PDFs'
                ]
            },
            {
                id: '24_months',
                name: '24 Months Plan',
                duration: 24,
                durationUnit: 'months',
                price: 7999,
                currency: 'INR',
                features: [
                    'All 12-month features',
                    'Lifetime content updates',
                    'Dedicated support',
                    'Certificate of completion'
                ]
            }
        ];

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans.'
        });
    }
});

// Get user's subscription
router.get('/my-subscription', verifyToken, async (req, res) => {
    try {
        const result = await db.query(`
      SELECT * FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      ORDER BY end_date DESC
      LIMIT 1
    `, [req.user.id]);

        res.json({
            success: true,
            data: result.rows.length > 0 ? result.rows[0] : null
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription.'
        });
    }
});

// Create subscription (placeholder - integrate with Stripe)
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { planType } = req.body;

        // TODO: Integrate with Stripe
        // This is a placeholder implementation

        const durationMonths = {
            '6_months': 6,
            '12_months': 12,
            '24_months': 24
        };

        const months = durationMonths[planType];
        if (!months) {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan type.'
            });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const result = await db.query(`
      INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, planType, 'active', startDate, endDate]);

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subscription.'
        });
    }
});

// Cancel subscription
router.post('/cancel', verifyToken, async (req, res) => {
    try {
        const result = await db.query(`
      UPDATE subscriptions
      SET status = 'cancelled', auto_renew = FALSE, updated_at = NOW()
      WHERE user_id = $1 AND status = 'active'
      RETURNING *
    `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found.'
            });
        }

        res.json({
            success: true,
            message: 'Subscription cancelled successfully.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription.'
        });
    }
});

module.exports = router;
