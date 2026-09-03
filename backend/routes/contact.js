const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

// POST /api/contact (Public form submission)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, company, service, budget, timeline, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
        }

        const stmt = `
            INSERT INTO contacts (name, email, phone, company, service, budget, timeline, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread')
        `;

        const result = db.run(stmt, [
            name.trim(),
            email.trim().toLowerCase(),
            phone || '',
            company || '',
            service || 'General Inquiry',
            budget || '',
            timeline || '',
            message.trim()
        ]);

        // Trigger email notification
        const notificationEmail = process.env.NOTIFICATION_EMAIL || 'AsifTechGlobal696788@gmail.com';
        sendEmail({
            to: notificationEmail,
            subject: `[New Inquiry] ${name} - ${service || 'General Inquiry'}`,
            text: `New contact inquiry received from ${name} (${email}):\n\nService: ${service}\nBudget: ${budget}\nPhone: ${phone}\nCompany: ${company}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                    <h2 style="color: #2563eb;">New AsifTechGlobal Inquiry</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                    <p><strong>Company:</strong> ${company || 'N/A'}</p>
                    <p><strong>Service:</strong> ${service || 'General'}</p>
                    <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
                    <p><strong>Timeline:</strong> ${timeline || 'N/A'}</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${message}</p>
                </div>
            `
        }).catch(e => console.error('Notification dispatch error:', e));

        res.status(201).json({
            success: true,
            message: 'Thank you for reaching out! Your message has been received.',
            inquiryId: result.lastInsertRowid
        });
    } catch (err) {
        console.error('[Contact POST Error]:', err);
        res.status(500).json({ success: false, message: 'Failed to submit message. Please try again.' });
    }
});

// GET /api/contact (Admin Only: List all inquiries)
router.get('/', verifyToken, (req, res) => {
    try {
        const contacts = db.all('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json({ success: true, count: contacts.length, data: contacts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/contact/:id (Admin Only: View single inquiry)
router.get('/:id', verifyToken, (req, res) => {
    try {
        const contact = db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }
        // Mark as read
        if (contact.status === 'unread') {
            db.run("UPDATE contacts SET status = 'read' WHERE id = ?", [req.params.id]);
            contact.status = 'read';
        }
        res.json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/contact/:id/status (Admin Only: update status)
router.put('/:id/status', verifyToken, (req, res) => {
    try {
        const { status } = req.body;
        if (!['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }
        db.run('UPDATE contacts SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: `Status updated to ${status}.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/contact/:id (Admin Only)
router.delete('/:id', verifyToken, (req, res) => {
    try {
        db.run('DELETE FROM contacts WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Message deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
