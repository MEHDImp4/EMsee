import React from 'react';
import { BASE_URL } from '../../services/api';

const ReplyComposer = ({ user, replyText, setReplyText, isSubmitting, onSubmit, textareaRef, placeholder }) => (
  <div className="reply-composer-page">
    <div className="reply-avatar">
      {user?.avatar ? (
        <img src={`${BASE_URL}${user.avatar}`} alt={user.username} />
      ) : (
        <div className="reply-avatar-fallback">{user?.username?.charAt(0).toUpperCase()}</div>
      )}
    </div>
    <div className="reply-input-section">
      <textarea
        ref={textareaRef}
        className="reply-textarea-page"
        placeholder={placeholder}
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows={3}
      />
      <div className="reply-actions-page">
        <button
          className="reply-submit-btn"
          onClick={onSubmit}
          disabled={!replyText.trim() || isSubmitting}
        >
          {isSubmitting ? 'Replying...' : 'Reply'}
        </button>
      </div>
    </div>
  </div>
);

export default ReplyComposer;