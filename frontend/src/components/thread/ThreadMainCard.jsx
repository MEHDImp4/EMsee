import React, { useState } from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../services/api';
import CommentService from '../../services/comment.service';

const formatCount = (value = 0) => {
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${value}`;
};

const ThreadMainCard = ({ comment, isReply }) => {
    const { t } = useTranslation();
    const [isLiked, setIsLiked] = useState(Boolean(comment?.isLiked));
    const [isReposted, setIsReposted] = useState(Boolean(comment?.isReposted));
    const [isSaved, setIsSaved] = useState(Boolean(comment?.isSaved));
    const [counts, setCounts] = useState({
        likes: comment?._count?.likes ?? 0,
        replies: comment?._count?.replies ?? 0,
        reposts: comment?._count?.reposts ?? 0,
        views: comment?.views ?? 0,
    });

    const avatarUrl = comment?.user?.avatar ? `${BASE_URL}${comment.user.avatar}` : null;
    const displayName = comment?.user?.full_name || comment?.user?.username || 'User';
    const handle = comment?.user?.username ? `@${comment.user.username}` : '';

    const createdAt = comment?.createdAt ? new Date(comment.createdAt) : null;
    const fullDate = createdAt ? createdAt.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }) : '';

    const optimistic = (field, delta) => {
        setCounts((prev) => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) }));
    };

    const toggleLike = async (e) => {
        e.stopPropagation();
        const next = !isLiked;
        setIsLiked(next);
        optimistic('likes', next ? 1 : -1);
        try {
            await CommentService.likeComment(comment.id);
        } catch (error) {
            setIsLiked(!next);
            optimistic('likes', next ? -1 : 1);
        }
    };

    const toggleRepost = async (e) => {
        e.stopPropagation();
        const next = !isReposted;
        setIsReposted(next);
        optimistic('reposts', next ? 1 : -1);
        try {
            await CommentService.repostComment(comment.id);
        } catch (error) {
            setIsReposted(!next);
            optimistic('reposts', next ? -1 : 1);
        }
    };

    const toggleSave = async (e) => {
        e.stopPropagation();
        const next = !isSaved;
        setIsSaved(next);
        try {
            await CommentService.saveComment(comment.id);
        } catch (error) {
            setIsSaved(!next);
        }
    };

    return (
        <div className="thread-main-card">
            <div className="thread-main-header">
                <div className="thread-main-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} />
                    ) : (
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="thread-main-user-info">
                    <span className="thread-main-name">{displayName}</span>
                    <span className="thread-main-handle">{handle}</span>
                </div>
                <button className="thread-more-btn">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="thread-main-text">{comment?.content}</div>

            <div className="thread-main-meta">
                <span className="thread-main-date">{fullDate}</span>
                <span className="thread-meta-dot">·</span>
                <span className="thread-main-views">
                    <strong>{formatCount(counts.views)}</strong> {t('post.views', 'Views')}
                </span>
            </div>

            <div className="thread-main-stats">
                <button className="thread-stat-btn" onClick={(e) => e.stopPropagation()}>
                    <BarChart3 size={16} />
                    <span>{t('post.view_engagements', 'View post engagements')}</span>
                </button>
            </div>

            <div className="thread-main-actions">
                <button
                    className={`thread-main-action-btn ${!isReply ? '' : 'disabled'}`}
                    style={{ opacity: isReply ? 0.5 : 1, cursor: isReply ? 'default' : 'pointer' }}
                >
                    <MessageCircle size={20} />
                </button>
                <button
                    className={`thread-main-action-btn ${isReposted ? 'active repost' : ''}`}
                    onClick={toggleRepost}
                >
                    <Repeat2 size={20} />
                </button>
                <button
                    className={`thread-main-action-btn ${isLiked ? 'active like' : ''}`}
                    onClick={toggleLike}
                >
                    <Heart size={20} />
                </button>
                <button className={`thread-main-action-btn ${isSaved ? 'active' : ''}`} onClick={toggleSave}>
                    <Bookmark size={20} />
                </button>
                <button className="thread-main-action-btn">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
    );
};

export default ThreadMainCard;
