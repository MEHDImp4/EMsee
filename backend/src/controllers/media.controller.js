const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Upload images
 * @route POST /api/media/upload
 */
const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map(file => `/uploads/images/${file.filename}`);

    res.json({
        message: 'Files uploaded successfully',
        images: imageUrls
    });
});

/**
 * Delete uploaded image
 * @route DELETE /api/media/:filename
 */
const deleteImage = asyncHandler(async (req, res) => {
    const { filename } = req.params;
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../uploads/images', filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = {
    uploadImages,
    deleteImage
};
