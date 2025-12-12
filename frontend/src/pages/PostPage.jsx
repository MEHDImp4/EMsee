import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PostCard from '../components/PostCard';
import './css/Feed.css';
import CommentCard from '../components/CommentCard';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import usePostPage from '../hooks/usePostPage';
import { BASE_URL } from '../services/api';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { socket } = useSocket();
    const { user } = useAuth();

    const {
        post,
        comments,
        loading,
        replyText,
        setReplyText,
        submitting,
        replyRef,
        handleSubmitReply,
        focusReplyBox
    } = usePostPage({ id, socket });

    const isOwnPost = post?.user?.id === user?.id;

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

            {!isOwnPost && (
                <div className="reply-composer">
                    <div className="reply-avatar">
                        {user?.avatar ? (
                            <img src={`${BASE_URL}${user.avatar}`} alt={user.username} />
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
            )}

            <div className="comments-section-page">
                {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
};

export default PostPage;
