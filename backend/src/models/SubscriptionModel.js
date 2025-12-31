const db = require('../database/connection');

class SubscriptionModel {
    /**
     * Get user's active subscription
     */
    static async getActiveByUser(userId) {
        const result = await db.query(`
            SELECT * FROM subscriptions 
            WHERE user_id = $1 
            AND status = 'active' 
            AND end_date > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `, [userId]);

        return result.rows[0] || null;
    }

    /**
     * Get subscription by ID
     */
    static async findById(id) {
        const result = await db.query(`
            SELECT * FROM subscriptions WHERE id = $1
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Get subscription by Stripe subscription ID
     */
    static async findByStripeId(stripeSubscriptionId) {
        const result = await db.query(`
            SELECT * FROM subscriptions 
            WHERE stripe_subscription_id = $1
        `, [stripeSubscriptionId]);

        return result.rows[0] || null;
    }

    /**
     * Create new subscription (PLACEHOLDER - Payment deferred)
     */
    static async create({
        userId, stripeCustomerId, stripeSubscriptionId,
        planType, startDate, endDate, autoRenew
    }) {
        const result = await db.query(`
            INSERT INTO subscriptions (
                user_id, stripe_customer_id, stripe_subscription_id, 
                plan_type, status, start_date, end_date, auto_renew
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            userId, stripeCustomerId, stripeSubscriptionId,
            planType, 'active', startDate, endDate, autoRenew !== false
        ]);

        return result.rows[0];
    }

    /**
     * Update subscription status
     */
    static async updateStatus(id, status) {
        const result = await db.query(`
            UPDATE subscriptions 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        return result.rows[0] || null;
    }

    /**
     * Cancel subscription
     */
    static async cancel(id) {
        const result = await db.query(`
            UPDATE subscriptions 
            SET status = 'cancelled', auto_renew = FALSE, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `, [id]);

        return result.rows[0] || null;
    }

    /**
     * Check if user has active subscription
     */
    static async hasActiveSubscription(userId) {
        const result = await db.query(`
            SELECT EXISTS(
                SELECT 1 FROM subscriptions 
                WHERE user_id = $1 
                AND status = 'active' 
                AND end_date > NOW()
            ) as has_subscription
        `, [userId]);

        return result.rows[0].has_subscription;
    }

    /**
     * Get all subscriptions for user
     */
    static async getByUser(userId) {
        const result = await db.query(`
            SELECT * FROM subscriptions 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `, [userId]);

        return result.rows;
    }

    /**
     * Get all subscriptions (admin)
     */
    static async getAll({ status, planType, limit = 50, offset = 0 }) {
        let query = `
            SELECT s.*, u.email, u.full_name
            FROM subscriptions s
            JOIN users u ON u.id = s.user_id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            query += ` AND s.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (planType) {
            query += ` AND s.plan_type = $${paramCount}`;
            params.push(planType);
            paramCount++;
        }

        query += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Get subscription statistics
     */
    static async getStats() {
        const result = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired,
                COUNT(CASE WHEN plan_type = '6_months' THEN 1 END) as plan_6m,
                COUNT(CASE WHEN plan_type = '12_months' THEN 1 END) as plan_12m,
                COUNT(CASE WHEN plan_type = '24_months' THEN 1 END) as plan_24m
            FROM subscriptions
        `);

        return result.rows[0];
    }

    /**
     * Mark expired subscriptions (cron job helper)
     */
    static async markExpired() {
        const result = await db.query(`
            UPDATE subscriptions 
            SET status = 'expired', updated_at = NOW()
            WHERE status = 'active' 
            AND end_date < NOW()
            RETURNING *
        `);

        return result.rows;
    }

    /**
     * Create payment record
     */
    static async createPayment({
        userId, subscriptionId, stripePaymentIntentId,
        amountCents, currency, status, paymentMethod
    }) {
        const result = await db.query(`
            INSERT INTO payment_history (
                user_id, subscription_id, stripe_payment_intent_id, 
                amount_cents, currency, status, payment_method
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            userId, subscriptionId, stripePaymentIntentId,
            amountCents, currency || 'USD', status, paymentMethod
        ]);

        return result.rows[0];
    }

    /**
     * Get payment history for user
     */
    static async getPaymentHistory(userId) {
        const result = await db.query(`
            SELECT * FROM payment_history 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `, [userId]);

        return result.rows;
    }
}

module.exports = SubscriptionModel;
