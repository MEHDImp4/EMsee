
import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const UserAvatar = ({ user, size = 40, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
            // If only one word, take first 2 chars
            return parts[0].substring(0, 2).toUpperCase();
        }
        // If multiple words, take first char of first 2 words
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    // Use static gray color
    const getColor = () => '#334155';

    const imageUrl = user?.avatar ? getImageUrl(user.avatar) : null;
    const name = user?.full_name || user?.name || user?.username || 'User';

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`user-avatar ${className}`}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover'
                }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            className={`user-avatar-placeholder ${className}`}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: getColor(name),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.4,
                fontWeight: 'bold',
                userSelect: 'none'
            }}
            title={name}
        >
            {getInitials(name)}
        </div>
    );
};

export default UserAvatar;
