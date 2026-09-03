const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/stats (Admin Only)
router.get('/', verifyToken, (req, res) => {
    try {
        const totalMessages = db.get('SELECT COUNT(*) as count FROM contacts')?.count || 0;
        const unreadMessages = db.get("SELECT COUNT(*) as count FROM contacts WHERE status = 'unread'")?.count || 0;
        const totalBlogs = db.get('SELECT COUNT(*) as count FROM blogs')?.count || 0;
        const totalPortfolio = db.get('SELECT COUNT(*) as count FROM portfolio')?.count || 0;
        const totalSubscribers = db.get('SELECT COUNT(*) as count FROM subscribers')?.count || 0;
        const totalPayments = db.get('SELECT COUNT(*) as count FROM payments')?.count || 0;
        const revenue = db.get("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'")?.total || 0;

        const recentMessages = db.all('SELECT id, name, email, service, created_at, status FROM contacts ORDER BY created_at DESC LIMIT 5');
        const recentPayments = db.all('SELECT id, order_id, client_name, amount, currency, status, created_at FROM payments ORDER BY created_at DESC LIMIT 5');

        res.json({
            success: true,
            data: {
                totalMessages,
                unreadMessages,
                totalBlogs,
                totalPortfolio,
                totalSubscribers,
                totalPayments,
                totalRevenue: Number(revenue).toFixed(2),
                recentMessages,
                recentPayments
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
