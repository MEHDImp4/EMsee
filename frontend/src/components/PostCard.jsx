import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import PostService from '../services/post.service';
import { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import './css/PostCard.css';

const formatCount = (value = 0) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(abs >= 10000000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return `${value}`;
};

const formatRelativeTime = (date) => {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const minute = 60000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d`;
  return date.toLocaleDateString();
};

const PostCard = ({ post, onDelete = () => { }, isDetailView = false, onCommentIntent }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openCompose } = useModal();

  const [isLiked, setIsLiked] = useState(Boolean(post?.isLiked));
  const [isReposted, setIsReposted] = useState(Boolean(post?.isReposted));
  const [isBusy, setIsBusy] = useState(false);
  const [counts, setCounts] = useState({
    likes: post?._count?.likes ?? 0,
    comments: post?._count?.comments ?? 0,
    reposts: post?._count?.reposts ?? 0,
    views: post?.views ?? post?.viewCount ?? 0,
  });

  const isOwner = user?.id && post?.user?.id && user.id === post.user.id;

  const avatarUrl = post?.user?.avatar ? `${BASE_URL}${post.user.avatar}` : null;
  const displayName = post?.user?.full_name || post?.user?.username || 'User';
  const handle = post?.user?.username ? `@${post.user.username}` : '';
  const userRole = post?.user?.role?.toLowerCase();
  const createdAt = useMemo(() => (post?.createdAt ? new Date(post.createdAt) : null), [post]);
  const timeLabel = useMemo(() => formatRelativeTime(createdAt), [createdAt]);

  const optimisticUpdate = (field, delta) => {
    setCounts((prev) => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) }));
  };

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!post?.id || isBusy) return;

    const next = !isLiked;
    setIsLiked(next);
    optimisticUpdate('likes', next ? 1 : -1);
    try {
      setIsBusy(true);
      await PostService.likePost(post.id);
    } catch (error) {
      console.error('Failed to toggle like', error);
      setIsLiked(!next);
      optimisticUpdate('likes', next ? -1 : 1);
    } finally {
      setIsBusy(false);
    }
  };

  const toggleRepost = async (e) => {
    e.stopPropagation();
    if (!post?.id || isBusy) return;

    const next = !isReposted;
    setIsReposted(next);
    optimisticUpdate('reposts', next ? 1 : -1);
    try {
      setIsBusy(true);
      await PostService.repostPost(post.id);
    } catch (error) {
      console.error('Failed to toggle repost', error);
      setIsReposted(!next);
      optimisticUpdate('reposts', next ? -1 : 1);
    } finally {
      setIsBusy(false);
    }
  };

  const goToPost = () => {
    if (isDetailView) return;
    navigate(`/posts/${post.id}`);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    if (isDetailView) {
      if (onCommentIntent) onCommentIntent();
      return;
    }
    openCompose(post);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!post?.id || !isOwner) return;
    const confirmed = window.confirm(t('post.confirm_delete', 'Delete this post?'));
    if (!confirmed) return;
    try {
      await PostService.deletePost(post.id);
      onDelete(post.id);
    } catch (error) {
      console.error('Failed to delete post', error);
    }
  };

  return (
    <article className={`post-card ${isDetailView ? 'post-card-detail' : ''}`} onClick={goToPost} role="article">
      <div className="post-avatar-col">
        <div className="post-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <span>{displayName.charAt(0)}</span>
          )}
        </div>
      </div>

      <div className="post-content-col">
        <header className="post-header">
          <div className="post-info">
            <div className="post-name-row">
              <span className="post-name">{displayName}</span>
              {userRole && (
                <span className={`post-role-badge post-role-${userRole}`}>
                  {userRole === 'professor'
                    ? t('feed.role.professor', 'Professor')
                    : userRole === 'admin'
                      ? t('feed.role.admin', 'Admin')
                      : t('feed.role.student', 'Student')}
                </span>
              )}
            </div>
            <div className="post-meta-row">
              {handle && <span className="post-handle">{handle}</span>}
              {timeLabel && <span className="post-dot">•</span>}
              {timeLabel && <span className="post-time">{timeLabel}</span>}
            </div>
          </div>

          <div className="post-header-actions">
            {isOwner && (
              <button className="ghost-icon-btn danger" onClick={handleDelete} aria-label={t('post.delete', 'Delete post')}>
                <Trash2 size={18} />
              </button>
            )}
            <button className="ghost-icon-btn" onClick={(e) => e.stopPropagation()} aria-label="More">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        <div className="post-text">{post?.content}</div>

        <div className="post-actions-bar">
          <button
            className={`action-btn comment ${isOwner ? 'disabled' : ''}`}
            onClick={handleCommentClick}
            disabled={isOwner}
            title={isOwner ? t('post.cannot_comment_own', "You cannot comment on your own post") : ''}
          >
            <div className="icon-wrapper">
              <MessageCircle size={18} />
            </div>
            <span className="action-count">{formatCount(counts.comments)}</span>
          </button>

          <button className={`action-btn repost ${isReposted ? 'active' : ''}`} onClick={toggleRepost}>
            <div className="icon-wrapper">
              <Repeat2 size={18} />
            </div>
            <span className="action-count">{formatCount(counts.reposts)}</span>
          </button>

          <button className={`action-btn like ${isLiked ? 'active' : ''}`} onClick={toggleLike}>
            <div className="icon-wrapper">
              <Heart size={18} />
            </div>
            <span className="action-count">{formatCount(counts.likes)}</span>
          </button>

          <button className="action-btn views" onClick={(e) => e.stopPropagation()}>
            <div className="icon-wrapper">
              <BarChart3 size={18} />
            </div>
            <span className="action-count">{formatCount(counts.views)}</span>
          </button>

          <div className="action-btn-group">
            <button className="ghost-icon-btn" onClick={(e) => e.stopPropagation()} aria-label="Bookmark">
              <Bookmark size={17} />
            </button>
            <button className="ghost-icon-btn" onClick={(e) => e.stopPropagation()} aria-label="Share">
              <Share2 size={17} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
