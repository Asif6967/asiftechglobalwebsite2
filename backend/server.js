require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getPool } = require('./db');
const contactRoutes = require('./routes/contact');
const blogRoutes = require('./routes/blog');
const portfolioRoutes = require('./routes/portfolio');
const authRoutes = require('./routes/auth');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required to start the server.');
    process.exit(1);
}

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/health/db', async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request().query('SELECT 1');
        return res.json({ db: 'ok' });
    } catch (error) {
        return res.status(503).json({ db: 'error', error: error.message });
    }
});

app.use('/api/contact', contactRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/auth', authRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
});

app.use(express.static(path.join(__dirname, '..')));

app.use((error, req, res, next) => {
    console.error(error);
    const status = Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({ success: false, error: error.message || 'Internal server error' });
});

app.listen(port, () => {
    console.log(`AsifTechGlobal server listening on port ${port}`);
});

module.exports = app;
