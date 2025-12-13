import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import useCommentPage from '../hooks/useCommentPage';
import ThreadHeader from '../components/thread/ThreadHeader';
import ThreadView from '../components/thread/ThreadView';
import '../pages/css/CommentPage.css';

const CommentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const {
    comment,
    replies,
    loading,
    error,
    replyText,
    setReplyText,
    isSubmitting,
    breadcrumbData,
    handleReplySubmit
  } = useCommentPage({ id, socket });

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="comment-page-container">
        <ThreadHeader onBack={handleBack} />
        <div className="thread-loading">Loading...</div>
      </div>
    );
  }

  if (error || !comment) {
    return (
      <div className="comment-page-container">
        <ThreadHeader onBack={handleBack} />
        <div className="thread-error">{error || 'Comment not found'}</div>
      </div>
    );
  }

  return (
    <div className="comment-page-container">
      <ThreadHeader onBack={handleBack} />
      <ThreadView
        comment={comment}
        replies={replies}
        breadcrumbData={breadcrumbData}
        replyText={replyText}
        setReplyText={setReplyText}
        isSubmitting={isSubmitting}
        handleReplySubmit={handleReplySubmit}
      />
    </div>
  );
};

export default CommentPage;
