const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/portfolio (Public: List projects)
router.get('/', (req, res) => {
    try {
        const { category } = req.query;
        let sql = 'SELECT * FROM portfolio WHERE 1=1';
        const params = [];

        if (category && category !== 'all') {
            sql += ' AND LOWER(category) = LOWER(?)';
            params.push(category);
        }

        sql += ' ORDER BY id DESC';

        const projects = db.all(sql, params);
        res.json({ success: true, count: projects.length, data: projects });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/portfolio/:id (Public: Get single project)
router.get('/:id', (req, res) => {
    try {
        const project = db.get('SELECT * FROM portfolio WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        res.json({ success: true, data: project });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/portfolio (Admin Only: Add project)
router.post('/', verifyToken, (req, res) => {
    try {
        const { title, category, description, tech_stack, client, demo_link, github_link, image } = req.body;

        if (!title || !category || !description) {
            return res.status(400).json({ success: false, message: 'Title, category, and description are required.' });
        }

        const stmt = `
            INSERT INTO portfolio (title, category, description, tech_stack, client, demo_link, github_link, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = db.run(stmt, [
            title.trim(),
            category.toLowerCase(),
            description.trim(),
            tech_stack || '',
            client || 'Global Client',
            demo_link || '',
            github_link || '',
            image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
        ]);

        res.status(201).json({
            success: true,
            message: 'Portfolio project added successfully.',
            projectId: result.lastInsertRowid
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/portfolio/:id (Admin Only: Update project)
router.put('/:id', verifyToken, (req, res) => {
    try {
        const { title, category, description, tech_stack, client, demo_link, github_link, image } = req.body;
        const id = req.params.id;

        const existing = db.get('SELECT id FROM portfolio WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const stmt = `
            UPDATE portfolio
            SET title = COALESCE(?, title),
                category = COALESCE(?, category),
                description = COALESCE(?, description),
                tech_stack = COALESCE(?, tech_stack),
                client = COALESCE(?, client),
                demo_link = COALESCE(?, demo_link),
                github_link = COALESCE(?, github_link),
                image = COALESCE(?, image)
            WHERE id = ?
        `;

        db.run(stmt, [title, category, description, tech_stack, client, demo_link, github_link, image, id]);

        res.json({ success: true, message: 'Project updated successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/portfolio/:id (Admin Only: Delete project)
router.delete('/:id', verifyToken, (req, res) => {
    try {
        db.run('DELETE FROM portfolio WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
