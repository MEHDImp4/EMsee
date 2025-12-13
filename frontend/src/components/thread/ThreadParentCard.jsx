import React from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { BASE_URL } from '../../services/api';

const formatCount = (value = 0) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${value}`;
};

const ThreadParentCard = ({ item, onClick }) => {
    const avatarUrl = item?.user?.avatar ? `${BASE_URL}${item.user.avatar}` : null;
    const displayName = item?.user?.full_name || item?.user?.username || 'User';
    const handle = item?.user?.username ? `@${item.user.username}` : '';

    const getTimeLabel = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const minute = 60000, hour = 60 * minute, day = 24 * hour;
        if (diff < minute) return 'now';
        if (diff < hour) return `${Math.floor(diff / minute)}m`;
        if (diff < day) return `${Math.floor(diff / hour)}h`;
        return `${Math.floor(diff / day)}d`;
    };

    return (
        <div className="thread-parent-card" onClick={onClick}>
            <div className="thread-parent-avatar-col">
                <div className="thread-parent-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} />
                    ) : (
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="thread-connector-line" />
            </div>
            <div className="thread-parent-content">
                <div className="thread-parent-header">
                    <span className="thread-parent-name">{displayName}</span>
                    <span className="thread-parent-handle">{handle}</span>
                    <span className="thread-parent-dot">·</span>
                    <span className="thread-parent-time">{getTimeLabel(item?.createdAt)}</span>
                    <button className="thread-more-btn" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal size={16} />
                    </button>
                </div>
                <div className="thread-parent-text">{item?.content}</div>
                <div className="thread-parent-actions">
                    <button className="thread-action-btn">
                        <MessageCircle size={16} />
                        <span>{formatCount(item?._count?.comments || item?._count?.replies || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <Repeat2 size={16} />
                        <span>{formatCount(item?._count?.reposts || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <Heart size={16} />
                        <span>{formatCount(item?._count?.likes || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <BarChart3 size={16} />
                        <span>{formatCount(item?.views || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <Bookmark size={15} />
                    </button>
                    <button className="thread-action-btn">
                        <Share2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThreadParentCard;
