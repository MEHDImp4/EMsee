import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from 'react-i18next';
import useCommentPage from '../hooks/useCommentPage';
import CommentService from '../services/comment.service';
import '../pages/css/CommentPage.css';
import { BASE_URL } from '../services/api';

const formatCount = (value = 0) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
};

// Mini card for parent post/comment in thread
const ThreadParentCard = ({ item, type = 'post', onClick }) => {
  const avatarUrl = item?.user?.avatar ? `${BASE_URL}${item.user.avatar}` : null;
  const displayName = item?.user?.full_name || item?.user?.username || 'User';
  const handle = item?.user?.username ? `@${item.user.username}` : '';

  const getTimeLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minute = 60000, hour = 60 * minute, day = 24 * hour;
    if (diff < minute) return 'now';
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    return `${Math.floor(diff / day)}d`;
  };

  return (
    <div className="thread-parent-card" onClick={onClick}>
      <div className="thread-parent-avatar-col">
        <div className="thread-parent-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="thread-connector-line" />
      </div>
      <div className="thread-parent-content">
        <div className="thread-parent-header">
          <span className="thread-parent-name">{displayName}</span>
          <span className="thread-parent-handle">{handle}</span>
          <span className="thread-parent-dot">·</span>
          <span className="thread-parent-time">{getTimeLabel(item?.createdAt)}</span>
          <button className="thread-more-btn" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="thread-parent-text">{item?.content}</div>
        <div className="thread-parent-actions">
          <button className="thread-action-btn">
            <MessageCircle size={16} />
            <span>{formatCount(item?._count?.comments || item?._count?.replies || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <Repeat2 size={16} />
            <span>{formatCount(item?._count?.reposts || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <Heart size={16} />
            <span>{formatCount(item?._count?.likes || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <BarChart3 size={16} />
            <span>{formatCount(item?.views || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <Bookmark size={15} />
          </button>
          <button className="thread-action-btn">
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main detail view for the current comment
const ThreadMainCard = ({ comment, isReply }) => {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = React.useState(Boolean(comment?.isLiked));
  const [isReposted, setIsReposted] = React.useState(Boolean(comment?.isReposted));
  const [isSaved, setIsSaved] = React.useState(Boolean(comment?.isSaved));
  const [counts, setCounts] = React.useState({
    likes: comment?._count?.likes ?? 0,
    replies: comment?._count?.replies ?? 0,
    reposts: comment?._count?.reposts ?? 0,
    views: comment?.views ?? 0,
  });

  const avatarUrl = comment?.user?.avatar ? `${BASE_URL}${comment.user.avatar}` : null;
  const displayName = comment?.user?.full_name || comment?.user?.username || 'User';
  const handle = comment?.user?.username ? `@${comment.user.username}` : '';

  const createdAt = comment?.createdAt ? new Date(comment.createdAt) : null;
  const fullDate = createdAt ? createdAt.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  const optimistic = (field, delta) => {
    setCounts((prev) => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) }));
  };

  const toggleLike = async (e) => {
    e.stopPropagation();
    const next = !isLiked;
    setIsLiked(next);
    optimistic('likes', next ? 1 : -1);
    try {
      await CommentService.likeComment(comment.id);
    } catch (error) {
      setIsLiked(!next);
      optimistic('likes', next ? -1 : 1);
    }
  };

  const toggleRepost = async (e) => {
    e.stopPropagation();
    const next = !isReposted;
    setIsReposted(next);
    optimistic('reposts', next ? 1 : -1);
    try {
      await CommentService.repostComment(comment.id);
    } catch (error) {
      setIsReposted(!next);
      optimistic('reposts', next ? -1 : 1);
    }
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    const next = !isSaved;
    setIsSaved(next);
    try {
      await CommentService.saveComment(comment.id);
    } catch (error) {
      setIsSaved(!next);
    }
  };

  return (
    <div className="thread-main-card">
      <div className="thread-main-header">
        <div className="thread-main-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="thread-main-user-info">
          <span className="thread-main-name">{displayName}</span>
          <span className="thread-main-handle">{handle}</span>
        </div>
        <button className="thread-more-btn">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="thread-main-text">{comment?.content}</div>

      <div className="thread-main-meta">
        <span className="thread-main-date">{fullDate}</span>
        <span className="thread-meta-dot">·</span>
        <span className="thread-main-views">
          <strong>{formatCount(counts.views)}</strong> {t('post.views', 'Views')}
        </span>
      </div>

      <div className="thread-main-stats">
        <button className="thread-stat-btn" onClick={(e) => e.stopPropagation()}>
          <BarChart3 size={16} />
          <span>{t('post.view_engagements', 'View post engagements')}</span>
        </button>
      </div>

      <div className="thread-main-actions">
        <button
          className={`thread-main-action-btn ${!isReply ? '' : 'disabled'}`}
          style={{ opacity: isReply ? 0.5 : 1, cursor: isReply ? 'default' : 'pointer' }}
        >
          <MessageCircle size={20} />
        </button>
        <button
          className={`thread-main-action-btn ${isReposted ? 'active repost' : ''}`}
          onClick={toggleRepost}
        >
          <Repeat2 size={20} />
        </button>
        <button
          className={`thread-main-action-btn ${isLiked ? 'active like' : ''}`}
          onClick={toggleLike}
        >
          <Heart size={20} />
        </button>
        <button className={`thread-main-action-btn ${isSaved ? 'active' : ''}`} onClick={toggleSave}>
          <Bookmark size={20} />
        </button>
        <button className="thread-main-action-btn">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

// Reply composer inline
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

// Reply item in the replies list  
const ThreadReplyItem = ({ reply }) => {
  const avatarUrl = reply?.user?.avatar ? `${BASE_URL}${reply.user.avatar}` : null;
  const displayName = reply?.user?.full_name || reply?.user?.username || 'User';
  const handle = reply?.user?.username ? `@${reply.user.username}` : '';

  const getTimeLabel = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minute = 60000, hour = 60 * minute, day = 24 * hour;
    if (diff < minute) return 'now';
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    return `${Math.floor(diff / day)}d`;
  };

  return (
    <div className="thread-reply-item">
      <div className="thread-reply-item-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="thread-reply-item-content">
        <div className="thread-reply-item-header">
          <span className="thread-reply-item-name">{displayName}</span>
          <span className="thread-reply-item-handle">{handle}</span>
          <span className="thread-reply-item-dot">·</span>
          <span className="thread-reply-item-time">{getTimeLabel(reply?.createdAt)}</span>
        </div>
        <div className="thread-reply-item-text">{reply?.content}</div>
        <div className="thread-reply-item-actions">
          <button className="thread-action-btn">
            <MessageCircle size={15} />
            <span>{formatCount(reply?._count?.replies || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <Repeat2 size={15} />
            <span>{formatCount(reply?._count?.reposts || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <Heart size={15} />
            <span>{formatCount(reply?._count?.likes || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <BarChart3 size={15} />
            <span>{formatCount(reply?.views || 0)}</span>
          </button>
          <button className="thread-action-btn">
            <Bookmark size={14} />
          </button>
          <button className="thread-action-btn">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

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
    handleReplySubmit
  } = useCommentPage({ id, socket });

  if (loading) {
    return (
      <div className="comment-page-container">
        <div className="thread-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h2>Post</h2>
        </div>
        <div className="thread-loading">Loading...</div>
      </div>
    );
  }

  if (error || !comment) {
    return (
      <div className="comment-page-container">
        <div className="thread-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h2>Post</h2>
        </div>
        <div className="thread-error">{error || 'Comment not found'}</div>
      </div>
    );
  }

  const isReply = !!comment.parentCommentId;
  const parentPost = breadcrumbData?.post;

  return (
    <div className="comment-page-container">
      {/* Header */}
      <div className="thread-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2>Post</h2>
      </div>

      {/* Thread View */}
      <div className="thread-content">
        {/* Parent Post (if this is a comment on a post) */}
        {parentPost && (
          <ThreadParentCard
            item={parentPost}
            type="post"
            onClick={() => navigate(`/posts/${parentPost.id}`)}
          />
        )}

        {/* Parent Comments in the path */}
        {breadcrumbData?.path?.map((parentComment, index) => (
          <ThreadParentCard
            key={parentComment.id}
            item={parentComment}
            type="comment"
            onClick={() => navigate(`/comments/${parentComment.id}`)}
          />
        ))}

        {/* Main Comment (Detail View) */}
        <ThreadMainCard comment={comment} isReply={isReply} />

        {/* Reply Composer - only for direct comments, not replies */}
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
    </div>
  );
};

export default CommentPage;
