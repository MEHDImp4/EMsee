import React, { useState } from 'react';
import { MessageCircle, Repeat, Heart, Share, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import PostService from '../services/post.service';
import '../styles/PostCard.css';

const PostCard = ({ post, onLike, onRepost, onDelete, isDetailView = false }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { openCompose } = useModal();
    const [showOptions, setShowOptions] = useState(false);

    // State for likes and reposts
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
    const [isReposted, setIsReposted] = useState(post.isReposted);
    const [repostsCount, setRepostsCount] = useState(post._count?.reposts || 0);

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm(t('post.confirm_delete', 'Are you sure you want to delete this post?'))) {
            try {
                await PostService.deletePost(post.id);
                if (onDelete) onDelete(post.id);
            } catch (error) {
                console.error("Failed to delete post", error);
            }
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            await PostService.likePost(post.id);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleRepost = async (e) => {
        e.stopPropagation();
        try {
            await PostService.repostPost(post.id);
            setIsReposted(!isReposted);
            setRepostsCount(prev => isReposted ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Failed to repost", error);
        }
    };

    const handleCommentClick = (e) => {
        e.stopPropagation();
        openCompose(post);
    };

    const handleCardClick = (e) => {
        if (isDetailView) return;
        const selection = window.getSelection();
        if (selection.toString().length > 0) return;
        navigate(`/post/${post.id}`);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`post-card ${isDetailView ? 'detail-view' : ''}`} onClick={handleCardClick} style={{ cursor: isDetailView ? 'default' : 'pointer' }}>
            {/* Repost Indicator */}
            {post.isRepostContext && (
                <div className="post-repost-indicator">
                    <Repeat size={14} />
                    <span>Reposted</span>
                </div>
            )}

            <div className="post-row">
                <div className="post-avatar-col">
                    <Link to={`/profile/${post.user?.username}`} onClick={(e) => e.stopPropagation()}>
                        {post.user?.avatar ?
                            <img src={`http://localhost:5000${post.user.avatar}`} alt={post.user.username} className="avatar-img" />
                            :
                            <div className="avatar-placeholder">
                                {(post.user?.full_name?.charAt(0) || post.user?.username?.charAt(0) || 'U')}
                            </div>
                        }
                    </Link>
                </div>

                <div className="post-content-col">
                    <div className="post-header">
                        <div className="post-meta">
                            <span className="post-name">{post.user?.full_name || post.user?.username}</span>
                            <span className="post-handle">@{post.user?.username}</span>
                            <span className="post-dot">·</span>
                            <span className="post-time">{formatTime(post.createdAt)}</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button className="more-options-btn" onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}>
                                <MoreHorizontal size={16} />
                            </button>
                            {showOptions && (
                                <div className="options-dropdown" style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    overflow: 'hidden'
                                }}>
                                    {user && post.userId === user.id ? (
                                        <button
                                            onClick={handleDelete}
                                            style={{ display: 'block', width: '100%', padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '14px' }}
                                        >
                                            {t('post.delete', 'Delete')}
                                        </button>
                                    ) : (
                                        <button
                                            style={{ display: 'block', width: '100%', padding: '8px 16px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap' }}
                                        >
                                            {t('post.report', 'Report')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="post-text">
                        {post.content}
                    </div>

                    <div className="post-actions">
                        <button className="action-btn comment" onClick={handleCommentClick}>
                            <div className="icon-wrapper"><MessageCircle size={18} /></div>
                            <span>{post._count?.comments || 0}</span>
                        </button>
                        <button className={`action-btn retweet ${isReposted ? 'active' : ''}`} onClick={handleRepost}>
                            <div className="icon-wrapper"><Repeat size={18} /></div>
                            <span>{repostsCount}</span>
                        </button>
                        <button className={`action-btn like ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                            <div className="icon-wrapper"><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></div>
                            <span>{likesCount}</span>
                        </button>
                        <button className="action-btn share" onClick={(e) => e.stopPropagation()}>
                            <div className="icon-wrapper"><Share size={18} /></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
