const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

// POST /api/upload (Admin Only)
router.post('/', verifyToken, (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    });
});

module.exports = router;
