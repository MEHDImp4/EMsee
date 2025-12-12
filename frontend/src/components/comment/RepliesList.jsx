import React from 'react';
import CommentCard from '../CommentCard';
import CommentThread from '../CommentThread';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const RepliesList = ({ replies, title }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (replies.length === 0) {
    return (
      <div className="comment-replies-section">
        <div className="comment-replies-header">
          <h3>{title} ({replies.length})</h3>
        </div>
        <div className="no-replies-message">
          {t('post.no_replies', 'No replies yet. Be the first!')}
        </div>
      </div>
    );
  }

  return (
    <div className="comment-replies-section">
      <div className="comment-replies-header">
        <h3>{title} ({replies.length})</h3>
      </div>
      <div className="comment-replies-list">
        {replies.map((reply) => (
          <CommentThread
            key={reply.id}
            comment={reply}
            currentUserId={user?.id}
            maxReplyDepth={0}
          />
        ))}
      </div>
    </div>
  );
};

export default RepliesList;