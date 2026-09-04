const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = new Map([
        ['.jpeg', 'image/jpeg'], ['.jpg', 'image/jpeg'], ['.png', 'image/png'],
        ['.webp', 'image/webp'], ['.gif', 'image/gif'], ['.svg', 'image/svg+xml'],
        ['.pdf', 'application/pdf'], ['.doc', 'application/msword'],
        ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ]);
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = allowedTypes.get(extension);

    if (mimetype && file.mimetype === mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image and document files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;
