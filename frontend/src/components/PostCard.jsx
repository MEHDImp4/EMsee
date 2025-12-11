import React, { useState } from 'react';
import { MessageCircle, Repeat, Heart, Share, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostService from '../services/post.service';

const PostCard = ({ post, onLike, onRepost, onDelete }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentsCount, setCommentsCount] = useState(post._count?.comments || 0);

    // State for likes and reposts
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
    const [isReposted, setIsReposted] = useState(post.isReposted);
    const [repostsCount, setRepostsCount] = useState(post._count?.reposts || 0);

    const handleDelete = async () => {
        if (window.confirm(t('post.confirm_delete', 'Are you sure you want to delete this post?'))) {
            try {
                await PostService.deletePost(post.id);
                if (onDelete) onDelete(post.id);
            } catch (error) {
                console.error("Failed to delete post", error);
            }
        }
    };

    const handleLike = async () => {
        try {
            await PostService.likePost(post.id);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleRepost = async () => {
        try {
            await PostService.repostPost(post.id);
            setIsReposted(!isReposted);
            setRepostsCount(prev => isReposted ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Failed to repost", error);
        }
    };

    const handleCommentClick = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const fetchedComments = await PostService.getComments(post.id);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Failed to load comments", error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        try {
            const comment = await PostService.commentPost(post.id, newComment);
            setComments([...comments, comment]);
            setNewComment('');
            setCommentsCount(prev => prev + 1);
        } catch (error) {
            console.error("Failed to post comment", error);
        }
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
        <div className="post-card">
            {/* Repost Indicator (Static for now, improve later if needed) */}
            {/* {post.isRepost && <div className="post-repost-indicator"><Repeat size={12} /> Reposted</div>} */}

            <div className="post-avatar-col">
                <Link to={`/profile/${post.user?.username}`} className="avatar-circle">
                    {post.user?.avatar ?
                        <img src={`http://localhost:5000${post.user.avatar}`} alt={post.user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : (post.user?.full_name?.charAt(0) || post.user?.username?.charAt(0) || 'U')}
                </Link>
            </div>

            <div className="post-content-col" style={{ flex: 1 }}>
                <div className="post-header">
                    <div className="post-info-row">
                        <span className="post-name">{post.user?.full_name || post.user?.username}</span>
                        <span className="post-handle">@{post.user?.username}</span>
                        <span className="post-dot">·</span>
                        <span className="post-time">{formatTime(post.createdAt)}</span>
                        {/* {post.user?.role === 'professor' && <span className="prof-badge">{t('feed.role.professor', 'Professeur')}</span>} */}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button className="more-options-btn" onClick={() => setShowOptions(!showOptions)}>
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
                                {user && post.userId === user.id && (
                                    <button
                                        onClick={handleDelete}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '8px 16px',
                                            textAlign: 'left',
                                            background: 'none',
                                            border: 'none',
                                            color: 'red',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {t('post.delete', 'Delete')}
                                    </button>
                                )}
                                {!user || post.userId !== user.id && (
                                    <button
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '8px 16px',
                                            textAlign: 'left',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-main)',
                                            fontSize: '14px',
                                            whiteSpace: 'nowrap'
                                        }}
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
                        <span>{commentsCount}</span>
                    </button>
                    <button className={`action-btn retweet ${isReposted ? 'active' : ''}`} onClick={handleRepost}>
                        <div className="icon-wrapper"><Repeat size={18} /></div>
                        <span>{repostsCount}</span>
                    </button>
                    <button className={`action-btn like ${isLiked ? 'active' : ''}`} onClick={handleLike}>
                        <div className="icon-wrapper"><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></div>
                        <span>{likesCount}</span>
                    </button>
                    <button className="action-btn share">
                        <div className="icon-wrapper"><Share size={18} /></div>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="comments-section" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                        {/* Comment Input */}
                        {post.replyPermission === 'NO_ONE' && post.user?.id !== user?.id ? (
                            <div style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                {t('post.reply_disabled', 'Replies are disabled for this post')}
                            </div>
                        ) : (
                            <div className="comment-input-area" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Post your reply"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmitComment();
                                        }
                                    }}
                                    style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)' }}
                                />
                                <button
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim()}
                                    style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: newComment.trim() ? 1 : 0.5 }}
                                >
                                    Reply
                                </button>
                            </div>
                        )}

                        {/* Comments List */}
                        {loadingComments ? (
                            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</div>
                        ) : comments.length > 0 ? (
                            <div className="comments-list">
                                {comments.map(comment => (
                                    <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                        <div className="comment-avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#ccc' }}>
                                            {comment.user?.avatar ?
                                                <img src={`http://localhost:5000${comment.user.avatar}`} alt={comment.user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(comment.user?.full_name || 'U').charAt(0)}</div>}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-header" style={{ display: 'flex', gap: '5px', fontSize: '13px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{comment.user?.full_name}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>@{comment.user?.username}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>· {formatTime(comment.createdAt)}</span>
                                            </div>
                                            <div className="comment-text" style={{ fontSize: '14px' }}>{comment.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>No comments yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
