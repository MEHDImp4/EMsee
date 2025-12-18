import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostService from '../services/post.service';
import { getImageUrl } from '../utils/imageUtils';
import { BASE_URL } from '../services/api';
import './css/PostPreviewBubble.css';

const PostPreviewBubble = ({ postId, fallbackContent }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const fetchPost = async () => {
            try {
                const response = await PostService.getPostById(postId);
                if (isMounted) {
                    setPost(response);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to fetch post preview", err);
                    setError(err);
                    setLoading(false);
                }
            }
        };

        if (postId) {
            fetchPost();
        }

        return () => { isMounted = false; };
    }, [postId]);

    const handleClick = (e) => {
        e.stopPropagation();
        navigate(`/posts/${postId}`);
    };

    if (loading) return <div className="post-preview-loading">Loading preview...</div>;

    if (error || !post) {
        // Simple helper to linkify text if needed, or just allow clicking the bubble to go to the post if we have ID
        return (
            <div className="post-preview-bubble error-state" onClick={handleClick}>
                <p className="post-preview-fallback" style={{ margin: 0 }}>
                    {fallbackContent || "Check out this post"}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    (Preview unavailable)
                </div>
            </div>
        );
    }

    // Extract first image if any
    const firstImage = post.media?.find(m => m.type === 'IMAGE');
    const avatarUrl = post.user?.avatar ? `${BASE_URL}${post.user.avatar}` : null;
    const displayName = post.user?.full_name || post.user?.username || 'User';

    return (
        <div className="post-preview-bubble" onClick={handleClick}>
            <div className="post-preview-header">
                <img
                    src={avatarUrl || '/default-avatar.svg'}
                    alt={displayName}
                    className="post-preview-avatar"
                    onError={(e) => e.target.src = '/default-avatar.svg'}
                />
                <div className="post-preview-user">
                    <span className="post-preview-name">{displayName}</span>
                    <span className="post-preview-handle">@{post.user?.username}</span>
                </div>
            </div>

            <div className="post-preview-content">
                <p className="post-preview-text line-clamp-2">{post.content}</p>

                {firstImage && (
                    <div className="post-preview-image-container">
                        <img
                            src={`${BASE_URL}${firstImage.url}`}
                            alt="Post attachment"
                            className="post-preview-image"
                        />
                    </div>
                )}

                {post.poll && (
                    <div className="post-preview-poll">
                        <span className="poll-icon">📊</span>
                        <span className="poll-question line-clamp-1">{post.poll.question}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostPreviewBubble;
