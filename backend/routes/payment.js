const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

// POST /api/payment/create-order
router.post('/create-order', (req, res) => {
    try {
        const { client_name, client_email, service, amount, currency } = req.body;

        if (!client_name || !client_email || !amount) {
            return res.status(400).json({ success: false, message: 'Client name, email, and amount are required.' });
        }

        const orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const curr = currency || 'USD';

        const stmt = `
            INSERT INTO payments (order_id, client_name, client_email, service, amount, currency, status, payment_method)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', 'card')
        `;

        db.run(stmt, [orderId, client_name.trim(), client_email.trim().toLowerCase(), service || 'Technology Consultation', amount, curr]);

        res.status(201).json({
            success: true,
            message: 'Payment order initiated',
            orderId,
            amount,
            currency: curr,
            mode: process.env.PAYMENT_MODE || 'sandbox',
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_asiftech_dummy_key'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/payment/verify (Simulate/Verify transaction)
router.post('/verify', async (req, res) => {
    try {
        const { orderId, transactionId, paymentMethod } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID is required.' });
        }

        const payment = db.get('SELECT * FROM payments WHERE order_id = ?', [orderId]);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found.' });
        }

        const txnId = transactionId || 'TXN-' + Date.now();
        const method = paymentMethod || 'Online Gateway';

        db.run(`
            UPDATE payments 
            SET status = 'completed', transaction_id = ?, payment_method = ?
            WHERE order_id = ?
        `, [txnId, method, orderId]);

        // Send confirmation email
        sendEmail({
            to: payment.client_email,
            subject: `[Payment Receipt] AsifTechGlobal Invoice ${orderId}`,
            text: `Dear ${payment.client_name},\n\nThank you for your payment of ${payment.currency} ${payment.amount} for ${payment.service}.\nTransaction ID: ${txnId}\nStatus: Completed\n\nBest regards,\nAsifTechGlobal Team`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #10b981;">Payment Received - AsifTechGlobal</h2>
                    <p>Dear <strong>${payment.client_name}</strong>,</p>
                    <p>Your payment has been successfully processed.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${orderId}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${txnId}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${payment.service}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${payment.currency} ${payment.amount}</strong></td></tr>
                    </table>
                    <p style="color: #64748b; font-size: 13px;">Thank you for partnering with AsifTechGlobal.</p>
                </div>
            `
        }).catch(e => console.error('Receipt email error:', e));

        res.json({
            success: true,
            message: 'Payment verified and marked as completed.',
            orderId,
            transactionId: txnId,
            status: 'completed'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/payment/transactions (Admin Only: List payments)
router.get('/transactions', verifyToken, (req, res) => {
    try {
        const transactions = db.all('SELECT * FROM payments ORDER BY created_at DESC');
        const revenue = db.get("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'");

        res.json({
            success: true,
            count: transactions.length,
            totalRevenue: revenue ? (revenue.total || 0) : 0,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
