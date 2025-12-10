
import express from 'express';
import { register, login, checkAvailability } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/check-availability', checkAvailability);

// Multer Config
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middlewares/authMiddleware';
import { updateProfile } from '../controllers/authController';

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

export default router;
