import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadParentCard from './ThreadParentCard';
import ThreadMainCard from './ThreadMainCard';
import ThreadReplyComposer from './ThreadReplyComposer';
import ThreadReplyItem from './ThreadReplyItem';
import { useAuth } from '../../context/AuthContext';

const ThreadView = ({
    comment,
    replies,
    breadcrumbData,
    replyText,
    setReplyText,
    isSubmitting,
    handleReplySubmit
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isReply = !!comment.parentCommentId;
    const parentPost = breadcrumbData?.post;

    return (
        <div className="thread-content">
            {/* Parent Post */}
            {parentPost && (
                <ThreadParentCard
                    item={parentPost}
                    onClick={() => navigate(`/posts/${parentPost.id}`)}
                />
            )}

            {/* Parent Comments */}
            {breadcrumbData?.path?.map((parentComment) => (
                <ThreadParentCard
                    key={parentComment.id}
                    item={parentComment}
                    onClick={() => navigate(`/comments/${parentComment.id}`)}
                />
            ))}

            {/* Main Comment */}
            <ThreadMainCard comment={comment} isReply={isReply} />

            {/* Reply Composer */}
            {user && !isReply && (
                <ThreadReplyComposer
                    user={user}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    isSubmitting={isSubmitting}
                    onSubmit={handleReplySubmit}
                />
            )}

            {/* Replies List */}
            {replies.length > 0 && (
                <div className="thread-replies">
                    {replies.map((reply) => (
                        <ThreadReplyItem key={reply.id} reply={reply} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThreadView;
