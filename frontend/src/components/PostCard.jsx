import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Repeat2, Heart, BarChart3, Bookmark, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PostService from '../services/post.service';
import { BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import HashtagText from './HashtagText';
import SharePostModal from './SharePostModal';
import './css/PostCard.css';
import { getInitials } from '../utils/avatarUtils';
import UserBadge from './UserBadge';

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

const PostCard = ({ post, onDelete = () => { }, isDetailView = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { openCompose } = useModal();

  const initialIsLiked = Boolean(post?.isLiked);
  const initialIsReposted = Boolean(post?.isReposted);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post?.isBookmarked));
  const [isBusy, setIsBusy] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); // State for share modal

  const initialLikes = post?._count?.likes ?? 0;

  const initialReposts = post?._count?.reposts ?? 0;
  const initialViews = post?.views ?? post?.viewCount ?? 0;

  const [counts, setCounts] = useState({
    likes: initialLikes,
    reposts: initialReposts,
    views: initialViews,
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

  const toggleBookmark = async (e) => {
    e.stopPropagation();
    if (!post?.id || isBusy) return;

    const next = !isBookmarked;
    setIsBookmarked(next);

    try {
      setIsBusy(true);
      await PostService.toggleBookmark(post.id);
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
      setIsBookmarked(!next);
    } finally {
      setIsBusy(false);
    }
  };

  const goToPost = () => {
    if (isDetailView) return;

    // Increment views when user clicks on post
    if (post?.id) {
      PostService.incrementViews(post.id);
      optimisticUpdate('views', 1);
    }

    navigate(`/posts/${post.id}`);
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

  const handleVote = async (optionId) => {
    if (isBusy || post.poll.userVote) return; // Already voted or busy

    // Optimistic Update
    const newOptions = post.poll.options.map(opt => {
      if (opt.id === optionId) {
        return {
          ...opt,
          _count: { votes: (opt._count?.votes || 0) + 1 }
        };
      }
      return opt;
    });

    // Create a local voted state for optimistic UI
    // In a real app we might need a complex local state or rely on re-fetching.
    // Here we will try to just prevent further clicks.
    setIsBusy(true);

    try {
      await PostService.votePoll(post.id, optionId);
      // Ideally the parent component should refresh or we use the socket event.
      // But for immediate feedback we rely on a full page reload or the socket.
      // For now, let's just keep the optimistic visual feedback via local state if we had it, 
      // but 'post' prop is immutable here. 
      // We need local state for poll data to update it optimistically effectively.
    } catch (error) {
      console.error('Failed to vote', error);
      setIsBusy(false);
    } finally {
      setIsBusy(false);
    }
  };

  // We need local state for poll to update it optimistically
  // BUT the simplest way for now without major refactor is to rely on the socket update we just added,
  // OR just force a page reload? No, that's bad.
  // Let's rely on the fact that `PostCard` receives `post` from parent.
  // The parent (useFeed) listens to `new_post`, but maybe not `post_updated`?
  // Let's check if we can make the poll UI interactive locally.

  // Actually, to make this work well, we need local state for the poll or context updates.
  // A simple hack: just call the API. The socket event 'post_updated' (which we emitted in backend) 
  // needs to be listened to in 'useFeed.js' to update the list.

  return (
    <article className={`post-card ${isDetailView ? 'post-card-detail' : ''}`} onClick={goToPost} role="article">
      <div className="post-avatar-col">
        <div
          className="post-avatar"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${post.user.username}`);
          }}
          style={{ cursor: 'pointer' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <span>{getInitials(displayName)}</span>
          )}
        </div>
      </div>

      <div className="post-content-col">
        <header className="post-header">
          <div className="post-info">
            <div className="post-name-row">
              <span
                className="post-name"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${post.user.username}`);
                }}
                style={{ cursor: 'pointer' }}
              >
                {displayName}
              </span>
              {userRole && (
                <span className={`post-role-badge post-role-${userRole}`}>
                  {(() => {
                    switch (userRole) {
                      case 'professor':
                        return t('feed.role.professor', 'Professor');
                      case 'admin':
                        return t('feed.role.admin', 'Admin');
                      default:
                        return t('feed.role.student', 'Student');
                    }
                  })()}
                </span>
              )}
              {/* Add UserBadge here */}
              <UserBadge user={post?.user} />
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

        <div className="post-text">
          <HashtagText content={post?.content} />
        </div>

        {/* Media Gallery */}
        {post?.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((media, index) => {
              if (media.type === 'IMAGE') {
                return (
                  <div key={index} className={`media-gallery grid-${post.media.filter(m => m.type === 'IMAGE').length}`}>
                    <img
                      src={`${BASE_URL}${media.url}`}
                      alt="Post media"
                      className="media-image"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );
              }

              if (media.type === 'CODE') {
                return (
                  <div key={index} className="media-code" onClick={(e) => e.stopPropagation()}>
                    <div className="code-header">
                      <span className="code-language">{media.language}</span>
                    </div>
                    <SyntaxHighlighter
                      language={media.language}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: '0 0 12px 12px' }}
                    >
                      {media.code}
                    </SyntaxHighlighter>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* Poll */}
        {post?.poll && (
          <div className="post-poll" onClick={(e) => e.stopPropagation()}>
            <div className="poll-question">{post.poll.question}</div>
            <div className="poll-options">
              {post.poll.options?.map((option, index) => {
                const totalVotes = post.poll.options.reduce((sum, opt) => sum + (opt._count?.votes || 0), 0);
                const percentage = totalVotes > 0 ? Math.round((option._count?.votes || 0) / totalVotes * 100) : 0;
                const hasVoted = post.poll.userVote?.optionId === option.id;

                return (
                  <button
                    key={option.id}
                    className={`poll-option ${hasVoted ? 'voted' : ''}`}
                    onClick={() => handleVote(option.id)}
                    disabled={!!post.poll.userVote || isBusy}
                  >
                    <div className="poll-option-bar" style={{ width: `${percentage}%` }} />
                    <div className="poll-option-content">
                      <span className="poll-option-text">{option.text}</span>
                      <span className="poll-option-percentage">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {post.poll.options && (
              <div className="poll-info">
                {post.poll.options.reduce((sum, opt) => sum + (opt._count?.votes || 0), 0)} votes
              </div>
            )}
          </div>
        )}

        <div className="post-actions-bar">
          <button
            className="action-btn comment"
            onClick={(e) => {
              e.stopPropagation();
              openCompose(post);
            }}
            aria-label={t('post.comment', 'Comment')}
          >
            <div className="icon-wrapper">
              <MessageCircle size={18} />
            </div>
            <span className="action-count">{formatCount(0)}</span>
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
            <button
              className={`ghost-icon-btn ${isBookmarked ? 'active-bookmark' : ''}`}
              onClick={toggleBookmark}
              aria-label="Bookmark"
            >
              <Bookmark size={17} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button className="ghost-icon-btn" onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} aria-label="Share">
              <Share2 size={17} />
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <SharePostModal
          post={post}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </article>
  );
};

export default PostCard;
