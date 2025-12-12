import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CommentCard from '../components/CommentCard';
import CommentBreadcrumb from '../components/CommentBreadcrumb';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from 'react-i18next';
import useCommentPage from '../hooks/useCommentPage';
import '../pages/css/CommentPage.css';

const CommentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const {
    comment,
    replies,
    loading,
    error,
    replyText,
    setReplyText,
    isSubmitting,
    breadcrumbData,
    replyTextareaRef,
    handleReplySubmit
  } = useCommentPage({ id, socket });

  if (loading) {
    return (
      <div className="comment-page-container">
        <div className="comment-page-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h2>{t('post.comment', 'Comment')}</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (error || !comment) {
    return (
      <div className="comment-page-container">
        <div className="comment-page-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h2>{t('post.comment', 'Comment')}</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-error, #dc2626)' }}>
          {error || 'Comment not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="comment-page-container">
      {/* Breadcrumb Navigation - only show if there are parent comments */}
      {!loading && breadcrumbData.path.length > 0 && (
        <CommentBreadcrumb 
          post={breadcrumbData.post} 
          path={breadcrumbData.path} 
          currentComment={comment}
        />
      )}

      {/* Header */}
      <div className="comment-page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2>{t('post.comment', 'Comment')}</h2>
        <div style={{ width: '36px' }} /> {/* Placeholder for alignment */}
      </div>

      {/* Main Comment */}
      <div className="comment-page-main">
        <CommentCard comment={comment} />
      </div>

      {/* Reply Composer */}
      {user && (
        <div className="reply-composer-page">
          <div className="reply-avatar">
            {user?.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt={user.username} />
            ) : (
              <div className="reply-avatar-fallback">{user?.username?.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="reply-input-section">
            <textarea
              ref={replyTextareaRef}
              className="reply-textarea-page"
              placeholder={t('post.reply_placeholder', 'Post your reply!')}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
            />
            <div className="reply-actions-page">
              <button
                className="reply-submit-btn"
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Replying...' : t('post.reply', 'Reply')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies Section */}
      <div className="comment-replies-section">
        <div className="comment-replies-header">
          <h3>{t('post.replies', 'Replies')} ({replies.length})</h3>
        </div>
        {replies.length === 0 ? (
          <div className="no-replies-message">
            {t('post.no_replies', 'No replies yet. Be the first!')}
          </div>
        ) : (
          <div className="comment-replies-list">
            {replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentPage;
