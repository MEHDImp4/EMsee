const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { register } = require('../controllers/auth/register.controller');
const { login } = require('../controllers/auth/login.controller');
const { checkAvailability } = require('../controllers/auth/availability.controller');
const { updateProfile } = require('../controllers/auth/profile.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const {
    registerSchema,
    loginSchema,
    updateProfileSchema
} = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/check-availability', checkAvailability); // Usually doesn't need strict schema or can use partial

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

router.put('/profile', verifyToken, upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), validate(updateProfileSchema), updateProfile);

module.exports = router;
