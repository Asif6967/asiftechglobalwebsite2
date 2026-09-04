const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const collections = {
    testimonials: {
        table: 'testimonials',
        fields: ['name', 'role', 'company', 'quote', 'rating', 'featured'],
        required: ['name', 'quote']
    },
    faqs: {
        table: 'faqs',
        fields: ['question', 'answer', 'sort_order', 'published'],
        required: ['question', 'answer']
    },
    packages: {
        table: 'service_packages',
        fields: ['name', 'audience', 'description', 'price_label', 'features', 'featured'],
        required: ['name', 'description']
    }
};

function getCollection(name, res) {
    const collection = collections[name];
    if (!collection) {
        res.status(404).json({ success: false, message: 'Collection not found.' });
        return null;
    }
    return collection;
}

router.get('/home', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                testimonials: db.all('SELECT * FROM testimonials WHERE featured = 1 ORDER BY created_at DESC'),
                faqs: db.all('SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order ASC, id ASC'),
                packages: db.all('SELECT * FROM service_packages ORDER BY featured DESC, id ASC')
            }
        });
    } catch (err) {
        console.error('[CMS Home Error]:', err);
        res.status(500).json({ success: false, message: 'Unable to load homepage content.' });
    }
});

router.get('/:collection', verifyToken, (req, res) => {
    const collection = getCollection(req.params.collection, res);
    if (collection) res.json({ success: true, data: db.all(`SELECT * FROM ${collection.table} ORDER BY id DESC`) });
});

router.post('/:collection', verifyToken, (req, res) => {
    const collection = getCollection(req.params.collection, res);
    if (!collection) return;
    const missing = collection.required.find(field => !String(req.body[field] ?? '').trim());
    if (missing) return res.status(400).json({ success: false, message: `${missing} is required.` });
    const fields = collection.fields.filter(field => req.body[field] !== undefined);
    if (!fields.length) return res.status(400).json({ success: false, message: 'No editable fields provided.' });
    const values = fields.map(field => req.body[field]);
    const placeholders = fields.map(() => '?').join(', ');
    const result = db.run(`INSERT INTO ${collection.table} (${fields.join(', ')}) VALUES (${placeholders})`, values);
    res.status(201).json({ success: true, message: 'Content created successfully.', id: result.lastInsertRowid });
});

router.put('/:collection/:id', verifyToken, (req, res) => {
    const collection = getCollection(req.params.collection, res);
    if (!collection) return;
    const fields = collection.fields.filter(field => req.body[field] !== undefined);
    if (!fields.length) return res.status(400).json({ success: false, message: 'No editable fields provided.' });
    const values = fields.map(field => req.body[field]);
    const result = db.run(`UPDATE ${collection.table} SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`, [...values, req.params.id]);
    if (!result.changes) return res.status(404).json({ success: false, message: 'Content not found.' });
    res.json({ success: true, message: 'Content updated successfully.' });
});

router.delete('/:collection/:id', verifyToken, (req, res) => {
    const collection = getCollection(req.params.collection, res);
    if (!collection) return;
    const result = db.run(`DELETE FROM ${collection.table} WHERE id = ?`, [req.params.id]);
    if (!result.changes) return res.status(404).json({ success: false, message: 'Content not found.' });
    res.json({ success: true, message: 'Content deleted successfully.' });
});

module.exports = router;
