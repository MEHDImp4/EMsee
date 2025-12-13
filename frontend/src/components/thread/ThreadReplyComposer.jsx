import React from 'react';
import { BASE_URL } from '../../services/api';

const ThreadReplyComposer = ({ user, replyText, setReplyText, isSubmitting, onSubmit }) => {
    const avatarUrl = user?.avatar ? `${BASE_URL}${user.avatar}` : null;

    return (
        <div className="thread-reply-composer">
            <div className="thread-reply-avatar">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={user.username} />
                ) : (
                    <span>{(user?.username || 'U').charAt(0).toUpperCase()}</span>
                )}
            </div>
            <input
                type="text"
                className="thread-reply-input"
                placeholder="Post your reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                        e.preventDefault();
                        onSubmit();
                    }
                }}
            />
            <button
                className="thread-reply-btn"
                onClick={onSubmit}
                disabled={!replyText.trim() || isSubmitting}
            >
                Reply
            </button>
        </div>
    );
};

export default ThreadReplyComposer;
