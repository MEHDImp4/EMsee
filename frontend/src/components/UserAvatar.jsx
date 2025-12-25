
import React, { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import { getInitials, getAvatarColor } from '../utils/avatarUtils';

const UserAvatar = ({ user, size = 40, className = '', onClick }) => {
    const [imageError, setImageError] = useState(false);

    const imageUrl = user?.avatar ? getImageUrl(user.avatar) : null;
    const name = user?.full_name || user?.name || user?.username || 'User';
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name);

    if (imageUrl && !imageError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`user-avatar ${className}`}
                onClick={onClick}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: onClick ? 'pointer' : 'default'
                }}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div
            className={`user-avatar-placeholder ${className}`}
            onClick={onClick}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: bgColor,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.4,
                fontWeight: 'bold',
                userSelect: 'none',
                cursor: onClick ? 'pointer' : 'default'
            }}
            title={name}
        >
            {initials}
        </div>
    );
};

export default UserAvatar;
