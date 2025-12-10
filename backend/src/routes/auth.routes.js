const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { register } = require('../controllers/auth/register.controller');
const { login } = require('../controllers/auth/login.controller');
const { checkAvailability } = require('../controllers/auth/availability.controller');
const { updateProfile } = require('../controllers/auth/profile.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/check-availability', checkAvailability);

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Images only!'));
    }
});

router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);

module.exports = router;
