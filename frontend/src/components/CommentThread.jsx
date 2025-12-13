import React, { useState, useMemo, useCallback } from 'react';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2, ChevronDown, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/CommentThread.css';
import CommentService from '../services/comment.service';
import { useModal } from '../context/ModalContext';
import { BASE_URL } from '../services/api';

const formatCount = (value = 0) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(abs >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return `${value}`;
};

const CommentThreadItem = ({ comment, options = {} }) => {
  const {
    depth = 0,
    maxDepth = 1,
    onReplySuccess,
    currentUserId,
    parentComment = null
  } = options;

  const navigate = useNavigate();
  const { openCompose } = useModal();
  const { t } = useTranslation();
  const initialIsLiked = Boolean(comment?.isLiked);
  const initialIsReposted = Boolean(comment?.isReposted);
  const initialIsSaved = Boolean(comment?.isSaved);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const [showReplies, setShowReplies] = useState(depth === 0);
  const [replies, setReplies] = useState(comment?.replies || []);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const initialLikes = comment?._count?.likes ?? 0;
  const initialReplies = comment?._count?.replies ?? 0;
  const initialReposts = comment?._count?.reposts ?? 0;
  const initialViews = comment?.views ?? comment?.viewCount ?? 0;

  const [counts, setCounts] = useState({
    likes: initialLikes,
    replies: initialReplies,
    reposts: initialReposts,
    views: initialViews,
  });

  const avatarUrl = comment?.user?.avatar ? `${BASE_URL}${comment.user.avatar}` : null;
  const displayName = comment?.user?.full_name || comment?.user?.username || 'User';
  const handle = comment?.user?.username ? `@${comment.user.username}` : '';
  const userRole = comment?.user?.role?.toLowerCase() || 'student';

  const createdAt = useMemo(() => (comment?.createdAt ? new Date(comment.createdAt) : null), [comment]);
  const timeLabel = useMemo(() => {
    if (!createdAt) return '';
    const diff = Date.now() - createdAt.getTime();
    const minute = 60000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return 'now';
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    if (diff < day * 7) return `${Math.floor(diff / day)}d`;
    return createdAt.toLocaleDateString();
  }, [createdAt]);

  const optimistic = useCallback((field, delta) => {
    setCounts((prev) => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) }));
  }, []);

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

  const handleReply = (e) => {
    e.stopPropagation();
    openCompose({ ...comment, isComment: true, isReply: true });
  };

  const handleToggleReplies = async (e) => {
    e.stopPropagation();
    if (!showReplies && replies.length === 0) {
      setIsLoadingReplies(true);
      try {
        const loadedReplies = await CommentService.getCommentReplies(comment.id);
        setReplies(loadedReplies);
      } catch (error) {
        console.error('Error loading replies:', error);
      } finally {
        setIsLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleNavigateToComment = () => {
    navigate(`/comments/${comment.id}`);
  };

  return (
    <div className={`comment-thread-item depth-${Math.min(depth, maxDepth)}`}>
      <div className="comment-thread-connector" />
      <div className="comment-thread-card">
        <div className="comment-thread-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <div className="comment-thread-avatar-fallback">{displayName.charAt(0)}</div>
          )}
        </div>

        <div className="comment-thread-content">
          {/* Show parent context if this is a reply */}
          {depth > 0 && comment?.parent && (
            <div className="comment-thread-parent-context">
              <AtSign size={14} />
              <span>{t('post.replying_to', 'Replying to')} <strong>{comment.parent.user?.full_name || comment.parent.user?.username}</strong></span>
            </div>
          )}

          <div className="comment-thread-header">
            <div className="comment-thread-meta">
              <span className="comment-thread-name">{displayName}</span>
              {userRole && (
                <span className={`comment-thread-role-badge comment-role-${userRole}`}>
                  {userRole === 'professor' ? 'Prof' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
              )}
              {handle && <span className="comment-thread-handle">{handle}</span>}
              {timeLabel && <span className="comment-thread-dot">•</span>}
              {timeLabel && <span className="comment-thread-time">{timeLabel}</span>}
            </div>
          </div>

          <div className="comment-thread-text">{comment.content}</div>

          <div className="comment-thread-actions">
            {/* Comment/Reply button - only allow reply if not at max depth */}
            {depth < maxDepth ? (
              <button
                className={`comment-thread-action-btn ${counts.replies > 0 ? 'has-count' : ''}`}
                onClick={counts.replies > 0 ? handleToggleReplies : handleReply}
              >
                <MessageCircle size={16} />
                <span>{formatCount(counts.replies)}</span>
              </button>
            ) : (
              <button
                className="comment-thread-action-btn disabled"
                onClick={(e) => e.stopPropagation()}
                style={{ opacity: 0.5, cursor: 'default' }}
              >
                <MessageCircle size={16} />
                <span>{formatCount(counts.replies)}</span>
              </button>
            )}
            <button
              className={`comment-thread-action-btn ${isReposted ? 'active' : ''}`}
              onClick={toggleRepost}
            >
              <Repeat2 size={16} />
              <span>{formatCount(counts.reposts)}</span>
            </button>
            <button
              className={`comment-thread-action-btn ${isLiked ? 'active like' : ''}`}
              onClick={toggleLike}
            >
              <Heart size={16} />
              <span>{formatCount(counts.likes)}</span>
            </button>
            <button className="comment-thread-action-btn">
              <BarChart3 size={16} />
              <span>{formatCount(counts.views)}</span>
            </button>
            <div className="comment-thread-action-trailing">
              <button
                className={`comment-thread-icon-btn ${isSaved ? 'active' : ''}`}
                onClick={toggleSave}
              >
                <Bookmark size={15} />
              </button>
              <button className="comment-thread-icon-btn" onClick={(e) => e.stopPropagation()}>
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* Show replies button if depth allows and there are replies */}
          {depth < maxDepth && counts.replies > 0 && (
            <button
              className={`comment-thread-show-replies ${showReplies ? 'expanded' : ''} ${isLoadingReplies ? 'loading' : ''}`}
              onClick={handleToggleReplies}
            >
              <ChevronDown size={16} />
              <span>
                {isLoadingReplies ? 'Loading...' : showReplies ? 'Hide' : 'Show'} {formatCount(counts.replies)} {counts.replies === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}

          {/* Quick reply button - only show at depth 0 (not for replies) */}
          {depth === 0 && (
            <button className="comment-thread-quick-reply" onClick={handleReply}>
              <MessageCircle size={14} />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="comment-thread-replies">
          {replies.map((reply) => (
            <CommentThreadItem
              key={reply.id}
              comment={reply}
              options={{
                depth: depth + 1,
                maxDepth,
                onReplySuccess,
                currentUserId,
                parentComment: comment
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentThread = ({ comment, currentUserId, maxReplyDepth = 1 }) => {
  const [mainComment, setMainComment] = useState(comment);

  const handleReplySuccess = useCallback(() => {
    // Refresh replies count
  }, []);

  return (
    <div className="comment-thread-container">
      <CommentThreadItem
        comment={mainComment}
        options={{
          depth: 0,
          maxDepth: maxReplyDepth,
          onReplySuccess: handleReplySuccess,
          currentUserId
        }}
      />
    </div>
  );
};

export default CommentThread;
