import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CommentCard from '../components/CommentCard';
import CommentBreadcrumb from '../components/CommentBreadcrumb';
import CommentService from '../services/comment.service';
import PostService from '../services/post.service';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from 'react-i18next';
import '../pages/css/CommentPage.css';

const CommentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { t } = useTranslation();

  const [comment, setComment] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breadcrumbData, setBreadcrumbData] = useState({ post: null, path: [] });
  const replyTextareaRef = useRef(null);
  const replyIdsRef = useRef(new Set());

  useEffect(() => {
    const loadComment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/posts/comments/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load comment');
        }

        const data = await response.json();
        setComment(data);
        
        // Fetch replies
        const repliesData = await CommentService.getCommentReplies(id);
        setReplies(repliesData || []);
        repliesData?.forEach((r) => replyIdsRef.current.add(r.id));

        // Fetch breadcrumb path
        try {
          const pathData = await CommentService.getCommentPath(id);
          setBreadcrumbData({
            post: pathData.post,
            path: pathData.path || []
          });
        } catch (pathError) {
          console.error('Error loading breadcrumb path:', pathError);
          // Continue without breadcrumb
        }
      } catch (err) {
        console.error('Error loading comment:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadComment();
  }, [id]);

  // Socket listener for new replies
  useEffect(() => {
    if (!socket) return;

    const handleCommentAdded = (newReply) => {
      if (newReply.parentCommentId === parseInt(id, 10) && !replyIdsRef.current.has(newReply.id)) {
        setReplies((prev) => [newReply, ...prev]);
        replyIdsRef.current.add(newReply.id);
      }
    };

    socket.on('comment_added', handleCommentAdded);
    return () => socket.off('comment_added', handleCommentAdded);
  }, [socket, id]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      setIsSubmitting(true);
      const newReply = await CommentService.replyToComment(id, replyText);

      if (newReply && !replyIdsRef.current.has(newReply.id)) {
        setReplies((prev) => [newReply, ...prev]);
        replyIdsRef.current.add(newReply.id);
      }

      setReplyText('');
      if (replyTextareaRef.current) {
        replyTextareaRef.current.blur();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
