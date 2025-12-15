import React, { useRef } from 'react';
import { X } from 'lucide-react';
import './css/ImageUpload.css';

const ImageUpload = ({ images, onImagesChange }) => {
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        
        const updatedImages = [...images, ...newImages].slice(0, 4); // Max 4 images
        onImagesChange(updatedImages);
    };

    const removeImage = (index) => {
        const updated = images.filter((_, i) => i !== index);
        onImagesChange(updated);
    };

    if (images.length === 0) return null;

    return (
        <div className="image-upload-preview">
            <div className={`image-grid grid-${images.length}`}>
                {images.map((img, index) => (
                    <div key={index} className="image-preview-item">
                        <img src={img.preview} alt={`Preview ${index + 1}`} />
                        <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
            />
        </div>
    );
};

export default ImageUpload;
