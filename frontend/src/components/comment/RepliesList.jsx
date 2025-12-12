import React from 'react';
import CommentCard from '../CommentCard';

const RepliesList = ({ replies, title }) => (
  <div className="comment-replies-section">
    <div className="comment-replies-header">
      <h3>{title} ({replies.length})</h3>
    </div>
    {replies.length === 0 ? (
      <div className="no-replies-message">
        No replies yet. Be the first!
      </div>
    ) : (
      <div className="comment-replies-list">
        {replies.map((reply) => (
          <CommentCard key={reply.id} comment={reply} />
        ))}
      </div>
    )}
  </div>
);

export default RepliesList;