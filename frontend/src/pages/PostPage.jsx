import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
import PostService from '../services/post.service';
import './css/Feed.css'; // Reuse feed styles

import { useSocket } from '../context/SocketContext';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { socket } = useSocket();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!socket) return;

        const handleNewComment = (newComment) => {
            if (newComment.postId === parseInt(id)) {
                setComments(prev => [...prev, newComment]);
                // Update post comment count locally
                setPost(prev => prev ? {
                    ...prev,
                    _count: {
                        ...prev._count,
                        comments: (prev._count?.comments || 0) + 1
                    }
                } : prev);
            }
        };

        socket.on('new_comment', handleNewComment);

        return () => {
            socket.off('new_comment', handleNewComment);
        };
    }, [socket, id]);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const [postData, commentsData] = await Promise.all([
                    PostService.getPostById(id),
                    PostService.getComments(id)
                ]);
                setPost(postData);
                setComments(commentsData || []);
            } catch (error) {
                console.error("Failed to load post", error);
                // Handle 404 or redirect
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPostAndComments();
        }
    }, [id]);

    const handleCommentAdded = (newComment) => {
        setComments([...comments, newComment]);
        // Optimistically update post comment count
        if (post) {
            setPost({
                ...post,
                _count: {
                    ...post._count,
                    comments: (post._count?.comments || 0) + 1
                }
            });
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (!post) return <div className="not-found">Post not found</div>;

    return (
        <div className="feed-container">
            <div className="feed-header sticky-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 1rem', height: '53px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Post</h2>
                </div>
            </div>

            <div className="post-detail-view">
                {/* 
                    We render the PostCard here. 
                    We might need to pass a prop to indicate it's the detail view 
                    if we want specific styling (like bigger font).
                */}
                <PostCard post={post} isDetailView={true} />
            </div>

            <div className="comments-section-page">
                {/* 
                    Note: PostCard usually handles its own comment section toggle. 
                    But in detail view, we want comments ALWAYS visible below.
                    So we might need to modify PostCard to NOT show the inline comments 
                    if isDetailView is true, and instead we show them here.
                */}
                {comments.map(comment => (
                    <div key={comment.id} className="comment-item" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                        <div className="comment-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                            {comment.user?.avatar
                                ? <img src={`http://localhost:5000${comment.user.avatar}`} alt={comment.user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(comment.user?.full_name || 'U').charAt(0)}</div>
                            }
                        </div>
                        <div className="comment-content" style={{ flex: 1 }}>
                            <div className="comment-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{comment.user?.full_name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>@{comment.user?.username}</span>
                                <span style={{ color: 'var(--text-muted)' }}>· {new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="comment-text" style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.5' }}>
                                {comment.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostPage;
