const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize DB and ensure schema & seeds
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file hosting
const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.resolve(__dirname, 'uploads');
const adminDir = path.resolve(rootDir, 'admin');

// Host uploaded images
app.use('/uploads', express.static(uploadsDir));

// Host Admin Panel
app.use('/admin', express.static(adminDir));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        app: 'AsifTechGlobal Full-Stack Dynamic Platform',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Host Main Frontend Website
app.use(express.static(rootDir));

// Fallback for non-API routes (SPA friendly)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    if (req.path.startsWith('/admin')) {
        return res.sendFile(path.join(adminDir, 'admin.html'));
    }
    res.sendFile(path.join(rootDir, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Server Error]:', err.stack || err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'An unexpected server error occurred.'
    });
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AsifTechGlobal Dynamic Server is running!`);
    console.log(`🌐 Website URL:     http://localhost:${PORT}`);
    console.log(`⚡ Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`📡 API Base:        http://localhost:${PORT}/api`);
    console.log(`====================================================`);
});

module.exports = app;
