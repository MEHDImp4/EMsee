import React from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2 } from 'lucide-react';
import { BASE_URL } from '../../services/api';

const formatCount = (value = 0) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${value}`;
};

const ThreadReplyItem = ({ reply }) => {
    const avatarUrl = reply?.user?.avatar ? `${BASE_URL}${reply.user.avatar}` : null;
    const displayName = reply?.user?.full_name || reply?.user?.username || 'User';
    const handle = reply?.user?.username ? `@${reply.user.username}` : '';

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
        <div className="thread-reply-item">
            <div className="thread-reply-item-avatar">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} />
                ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <div className="thread-reply-item-content">
                <div className="thread-reply-item-header">
                    <span className="thread-reply-item-name">{displayName}</span>
                    <span className="thread-reply-item-handle">{handle}</span>
                    <span className="thread-reply-item-dot">·</span>
                    <span className="thread-reply-item-time">{getTimeLabel(reply?.createdAt)}</span>
                </div>
                <div className="thread-reply-item-text">{reply?.content}</div>
                <div className="thread-reply-item-actions">
                    <button className="thread-action-btn">
                        <MessageCircle size={15} />
                        <span>{formatCount(reply?._count?.replies || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <Repeat2 size={15} />
                        <span>{formatCount(reply?._count?.reposts || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <Heart size={15} />
                        <span>{formatCount(reply?._count?.likes || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <BarChart3 size={15} />
                        <span>{formatCount(reply?.views || 0)}</span>
                    </button>
                    <button className="thread-action-btn">
                        <Bookmark size={14} />
                    </button>
                    <button className="thread-action-btn">
                        <Share2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThreadReplyItem;
