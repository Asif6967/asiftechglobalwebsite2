const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    console.log('[Email] SMTP Transporter configured.');
} else {
    console.log('[Email] SMTP credentials not set. Email notifications will be logged to console.');
}

async function sendEmail({ to, subject, html, text }) {
    if (!transporter) {
        console.log('\n--- [SIMULATED EMAIL NOTIFICATION] ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message Preview:\n${text || html}`);
        console.log('-------------------------------------\n');
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: `"AsifTechGlobal" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log(`[Email] Message sent: ${info.messageId}`);
        return { success: true, info };
    } catch (err) {
        console.error('[Email Error]:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendEmail
};
