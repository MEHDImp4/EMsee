import api from './api';

/**
 * Upload images to the server
 * @param {File[]} files - Array of image files to upload (max 4)
 * @returns {Promise<string[]>} Array of image URLs
 */
export const uploadImages = async (files) => {
    // Validate file sizes before upload
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(file => file.size > MAX_SIZE);
    
    if (invalidFiles.length > 0) {
        throw new Error(`Les fichiers suivants sont trop volumineux (max 10MB): ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    const formData = new FormData();
    
    // Add files to FormData
    files.forEach(file => {
        formData.append('images', file);
    });

    const response = await api.post('/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.images; // Response is already the data object
};

/**
 * Delete an uploaded image
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteImage = async (filename) => {
    const response = await api.delete(`/media/${filename}`);
    return response;
};
