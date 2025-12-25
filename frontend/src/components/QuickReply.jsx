import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Image as ImageIcon } from 'lucide-react';
import PostService from '../services/post.service';
import { useAuth } from '../context/AuthContext';
import './css/QuickReply.css';

const QuickReply = ({ parentPost, onReplySuccess }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const newReply = await PostService.createPost(
                content,
                'EVERYONE',
                null,
                null,
                parentPost.id
            );

            setContent('');
            if (onReplySuccess) {
                onReplySuccess(newReply);
            }
        } catch (error) {
            console.error('Failed to reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="quick-reply-container">
            <div className="quick-reply-avatar">
                <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                />
            </div>
            <div className="quick-reply-content">
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder={t('post.reply_placeholder', 'Post your reply')}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={1}
                        style={{ height: 'auto', minHeight: '40px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    <div className="quick-reply-actions">
                        {/* Placeholder for future media attachment features */}
                        <div className="quick-reply-tools">
                            {/* <button type="button" className="tool-btn"><ImageIcon size={18} /></button> */}
                        </div>
                        <button
                            type="submit"
                            className="reply-btn"
                            disabled={!content.trim() || isSubmitting}
                        >
                            {isSubmitting ? t('common.sending', 'Sending...') : t('post.reply', 'Reply')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickReply;
