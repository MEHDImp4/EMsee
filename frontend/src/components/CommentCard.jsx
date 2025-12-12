import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2 } from 'lucide-react';
import './css/CommentCard.css';
import CommentService from '../services/comment.service';
import { useModal } from '../context/ModalContext';
import { BASE_URL } from '../services/api';

const formatCount = (value = 0) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(abs >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return `${value}`;
};

const CommentCard = ({ comment, onReply, disableReply = false }) => {
  const navigate = useNavigate();
  const { openCompose } = useModal();
  const [isLiked, setIsLiked] = useState(Boolean(comment?.isLiked));
  const [isReposted, setIsReposted] = useState(Boolean(comment?.isReposted));
  const [isSaved, setIsSaved] = useState(Boolean(comment?.isSaved));
  const [counts, setCounts] = useState({
    likes: comment?._count?.likes ?? 0,
    replies: comment?._count?.replies ?? 0,
    reposts: comment?._count?.reposts ?? 0,
    views: comment?.views ?? comment?.viewCount ?? 0,
  });

  const avatarUrl = comment?.user?.avatar ? `${BASE_URL}${comment.user.avatar}` : null;
  const displayName = comment?.user?.full_name || comment?.user?.username || 'User';
  const handle = comment?.user?.username ? `@${comment.user.username}` : '';
  const userRole = comment?.user?.role?.toLowerCase() || 'student';

  // Debug log
  if (comment?.user?.role) {
    console.log('Comment user role:', comment.user.role, 'userRole:', userRole);
  }

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

  const optimistic = (field, delta) => {
    setCounts((prev) => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) }));
  };

  const toggleLike = async () => {
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

  const toggleRepost = async () => {
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

  const toggleSave = async () => {
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
    openCompose({ ...comment, isComment: true });
    if (onReply) onReply();
  };

  const handleNavigateToComment = () => {
    navigate(`/comments/${comment.id}`);
  };

  return (
    <article className="comment-card" onClick={handleNavigateToComment} style={{ cursor: 'pointer' }}>
      <div className="comment-avatar">
        {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : <div className="comment-avatar-fallback">{displayName.charAt(0)}</div>}
      </div>
      <div className="comment-body">
        <div className="comment-header-row">
          <span className="comment-name">{displayName}</span>
          {userRole && (
            <span className={`comment-role-badge comment-role-${userRole}`}>
              {userRole === 'professor' ? 'Prof' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          )}
          {handle && <span className="comment-handle">{handle}</span>}
          {timeLabel && <span className="comment-dot">•</span>}
          {timeLabel && <span className="comment-time">{timeLabel}</span>}
        </div>
        <div className="comment-text">{comment.content}</div>
        <div className="comment-actions">
          <button
            className="comment-action-btn"
            onClick={handleReply}
            style={{ visibility: disableReply ? 'hidden' : 'visible' }}
          >
            <MessageCircle size={16} />
            <span>{formatCount(counts.replies)}</span>
          </button>
          <button className={`comment-action-btn ${isReposted ? 'active' : ''}`} onClick={toggleRepost}>
            <Repeat2 size={16} />
            <span>{formatCount(counts.reposts)}</span>
          </button>
          <button className={`comment-action-btn ${isLiked ? 'active like' : ''}`} onClick={toggleLike}>
            <Heart size={16} />
            <span>{formatCount(counts.likes)}</span>
          </button>
          <button className="comment-action-btn" onClick={(e) => e.stopPropagation()}>
            <BarChart3 size={16} />
            <span>{formatCount(counts.views)}</span>
          </button>
          <div className="comment-action-trailing">
            <button className={`comment-icon-btn ${isSaved ? 'active' : ''}`} onClick={toggleSave}>
              <Bookmark size={15} />
            </button>
            <button className="comment-icon-btn" onClick={(e) => e.stopPropagation()}>
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CommentCard;