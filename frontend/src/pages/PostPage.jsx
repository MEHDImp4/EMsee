import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
import PostService from '../services/post.service';
import './css/Feed.css';
import CommentCard from '../components/CommentCard';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { socket } = useSocket();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const replyRef = useRef(null);
    const commentIdsRef = useRef(new Set());

    const commentExists = (commentId) => commentIdsRef.current.has(commentId);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const [postData, commentsData] = await Promise.all([
                    PostService.getPostById(id),
                    PostService.getComments(id)
                ]);

                setPost(postData);
                const safeComments = commentsData || [];
                setComments(safeComments);
                commentIdsRef.current = new Set(safeComments.map((c) => c.id));
            } catch (error) {
                console.error('Failed to load post', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPostAndComments();
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const handleNewComment = (newComment) => {
            if (newComment.postId === parseInt(id) && !commentExists(newComment.id)) {
                commentIdsRef.current.add(newComment.id);
                setComments((prev) => [...prev, newComment]);
                setPost((prev) => prev ? {
                    ...prev,
                    _count: {
                        ...prev._count,
                        comments: (prev._count?.comments || 0) + 1
                    }
                } : prev);
            }
        };

        socket.on('new_comment', handleNewComment);
        return () => socket.off('new_comment', handleNewComment);
    }, [socket, id]);

    const handleCommentAdded = (newComment) => {
        if (commentExists(newComment.id)) return;
        commentIdsRef.current.add(newComment.id);
        setComments((prev) => [...prev, newComment]);
        setPost((prev) => prev ? {
            ...prev,
            _count: {
                ...prev._count,
                comments: (prev._count?.comments || 0) + 1
            }
        } : prev);
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim() || !post?.id || submitting) return;
        try {
            setSubmitting(true);
            const newComment = await PostService.commentPost(post.id, replyText.trim());
            setReplyText('');
            handleCommentAdded(newComment);
            if (replyRef.current) replyRef.current.focus();
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setSubmitting(false);
        }
    };

    const focusReplyBox = () => {
        if (replyRef.current) {
            replyRef.current.focus();
            replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                <PostCard post={post} isDetailView={true} onCommentIntent={focusReplyBox} />
            </div>

            <div className="reply-composer">
                <div className="reply-avatar">
                    {user?.avatar ? (
                        <img src={`http://localhost:5000${user.avatar}`} alt={user.username} />
                    ) : (
                        <span>{(user?.full_name || user?.username || 'U').charAt(0)}</span>
                    )}
                </div>
                <div className="reply-input-col">
                    <textarea
                        className="reply-textarea"
                        rows="3"
                        placeholder={t('post.reply_placeholder', 'Ajouter une réponse')}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        ref={replyRef}
                    />
                    <div className="reply-actions">
                        <div className="reply-hint">{t('post.replying_to', 'En réponse à')} @{post?.user?.username}</div>
                        <button
                            className="reply-btn"
                            onClick={handleSubmitReply}
                            disabled={!replyText.trim() || submitting}
                        >
                            {submitting ? t('common.save', 'Enregistrer') : t('post.reply', 'Répondre')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="comments-section-page">
                {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
};

export default PostPage;
