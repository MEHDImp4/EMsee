const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media upload and management
 */

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload images
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No files uploaded
 */
router.post('/upload', authenticateToken, upload.array('images', 4), mediaController.uploadImages);

/**
 * @swagger
 * /api/media/{filename}:
 *   delete:
 *     summary: Delete uploaded image
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/:filename', authenticateToken, mediaController.deleteImage);

module.exports = router;
