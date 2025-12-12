import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentCard from '../components/CommentCard';
import CommentBreadcrumb from '../components/CommentBreadcrumb';
import CommentHeader from '../components/comment/CommentHeader';
import ReplyComposer from '../components/comment/ReplyComposer';
import RepliesList from '../components/comment/RepliesList';
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
        <CommentHeader title={t('post.comment', 'Comment')} onBack={() => navigate(-1)} />
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (error || !comment) {
    return (
      <div className="comment-page-container">
        <CommentHeader title={t('post.comment', 'Comment')} onBack={() => navigate(-1)} />
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
      <CommentHeader title={t('post.comment', 'Comment')} onBack={() => navigate(-1)} />

      {/* Main Comment */}
      <div className="comment-page-main">
        <CommentCard comment={comment} />
      </div>

      {/* Reply Composer */}
      {user && (
        <ReplyComposer
          user={user}
          replyText={replyText}
          setReplyText={setReplyText}
          isSubmitting={isSubmitting}
          onSubmit={handleReplySubmit}
          textareaRef={replyTextareaRef}
          placeholder={t('post.reply_placeholder', 'Post your reply!')}
        />
      )}

      {/* Replies Section */}
      <RepliesList
        replies={replies}
        title={t('post.replies', 'Replies')}
      />
    </div>
  );
};

export default CommentPage;
