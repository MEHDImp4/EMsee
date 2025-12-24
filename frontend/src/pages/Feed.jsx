import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, BarChart2, Code, Globe, Users, Lock } from 'lucide-react';
import PostCard from '../components/PostCard';
import ImageUpload from '../components/ImageUpload';
import CodeEditor from '../components/CodeEditor';
import PollCreator from '../components/PollCreator';
import { useAuth } from '../context/AuthContext';
import useFeed from '../hooks/useFeed';
import { BASE_URL } from '../services/api';
import { getInitials } from '../utils/avatarUtils';
import './css/Feed.css';

const Feed = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const {
    activeTab,
    setActiveTab,
    posts,
    loading,
    newPostContent,
    setNewPostContent,
    replyPermission,
    setReplyPermission,
    showPermissionMenu,
    setShowPermissionMenu,
    permissionMenuRef,
    handlePostSubmit,
    handleDeletePost,
    mediaFiles,
    setMediaFiles,
    codeSnippet,
    setCodeSnippet,
    pollData,
    setPollData,
    isUploading,
    loadMore,
    hasMore
  } = useFeed();

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newPostContent;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setNewPostContent(before + emoji + after);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    // Validate file sizes
    const invalidFiles = files.filter(file => file.size > MAX_SIZE);
    if (invalidFiles.length > 0) {
      alert(`Fichier(s) trop volumineux! Maximum 10MB par image.\nFichiers rejetés: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    const updatedImages = [...mediaFiles, ...newImages].slice(0, 4);
    setMediaFiles(updatedImages);
  };

  const handleCodeClick = () => {
    if (!codeSnippet) {
      setCodeSnippet({ code: '', language: 'javascript' });
    } else {
      setCodeSnippet(null);
    }
  };

  const handlePollClick = () => {
    if (!pollData) {
      setPollData({ question: '', options: ['', ''] });
    } else {
      setPollData(null);
    }
  };

  const loaderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loadMore]);

  return (
    <div className="feed-container">
      {/* Sticky Header with Tabs */}
      <div className="feed-header sticky-header">
        <h2 className="mobile-only-title">{t('sidebar.home', 'Accueil')}</h2>
        <div className="feed-tabs">
          <button
            className={`tab-item ${activeTab === 'foryou' ? 'active' : ''}`}
            onClick={() => setActiveTab('foryou')}
          >
            <span>{t('feed.tabs.foryou', 'Pour vous')}</span>
            {activeTab === 'foryou' && <div className="tab-indicator" />}
          </button>
          <button
            className={`tab-item ${activeTab === 'class' ? 'active' : ''}`}
            onClick={() => setActiveTab('class')}
          >
            <span>
              {t('feed.tabs.class', 'Ma Classe')}
              {user?.studentClass && ` (${user.studentClass})`}
            </span>
            {activeTab === 'class' && <div className="tab-indicator" />}
          </button>
        </div>
      </div>

      {/* Compose Area */}
      <div className="compose-area">
        <div className="compose-avatar">
          <div className="avatar-circle">
            {user?.avatar ?
              <img src={`${BASE_URL}${user.avatar}`} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (getInitials(user?.full_name || user?.username))}
          </div>
        </div>
        <div className="compose-content">
          <textarea
            ref={textareaRef}
            placeholder={t('feed.placeholder', "Quoi de neuf à l'EMSI ?")}
            className="compose-input"
            rows="3"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isUploading) {
                e.preventDefault();
                handlePostSubmit();
              }
            }}
          />

          {/* Media Previews */}
          <ImageUpload images={mediaFiles} onImagesChange={setMediaFiles} />
          <CodeEditor
            code={codeSnippet?.code}
            language={codeSnippet?.language}
            onCodeChange={setCodeSnippet}
            onClose={() => setCodeSnippet(null)}
          />
          <PollCreator
            poll={pollData}
            onPollChange={setPollData}
            onClose={() => setPollData(null)}
          />

          <div className="compose-reply-permission" ref={permissionMenuRef} onClick={() => setShowPermissionMenu(!showPermissionMenu)}>
            {replyPermission === 'EVERYONE' && <Globe size={18} />}
            {replyPermission === 'FOLLOWERS' && <Users size={18} />}
            {replyPermission === 'NO_ONE' && <Lock size={18} />}

            <span className="permission-text">
              {replyPermission === 'EVERYONE' && t('feed.everyone_can_reply', 'Tout le monde peut répondre')}
              {replyPermission === 'FOLLOWERS' && t('feed.followers_can_reply', 'Abonnés uniquement')}
              {replyPermission === 'NO_ONE' && t('feed.no_one_can_reply', 'Personne ne peut répondre')}
            </span>

            {showPermissionMenu && (
              <div className="permission-menu">
                <div
                  className="permission-item"
                  onClick={(e) => { e.stopPropagation(); setReplyPermission('EVERYONE'); setShowPermissionMenu(false); }}
                >
                  <Globe size={18} />
                  <span>{t('feed.everyone', 'Tout le monde')}</span>
                </div>
                <div
                  className="permission-item"
                  onClick={(e) => { e.stopPropagation(); setReplyPermission('FOLLOWERS'); setShowPermissionMenu(false); }}
                >
                  <Users size={18} />
                  <span>{t('feed.followers', 'Abonnés uniquement')}</span>
                </div>
                <div
                  className="permission-item"
                  onClick={(e) => { e.stopPropagation(); setReplyPermission('NO_ONE'); setShowPermissionMenu(false); }}
                >
                  <Lock size={18} />
                  <span>{t('feed.no_one', 'Personne')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="compose-actions">
            <div className="compose-icons">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                className="icon-btn"
                type="button"
                title="Images"
                onClick={handleImageClick}
              >
                <Image size={20} />
              </button>
              <button
                className="icon-btn"
                type="button"
                title="Code"
                onClick={handleCodeClick}
              >
                <Code size={20} />
              </button>
              <button
                className="icon-btn"
                type="button"
                title="Sondage"
                onClick={handlePollClick}
              >
                <BarChart2 size={20} />
              </button>
            </div>
            <button
              className="post-btn-small"
              onClick={handlePostSubmit}
              disabled={(!newPostContent.trim() && !mediaFiles.length && !codeSnippet && !pollData) || isUploading}
            >
              {isUploading ? t('feed.uploading', 'Publication...') : t('sidebar.publish', 'Publier')}
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {posts?.map((post, index) => (
          <PostCard key={`${post.id}-${index}`} post={post} onDelete={handleDeletePost} />
        ))}

        {/* Infinite Scroll Loader / Sentinel */}
        <div
          ref={loaderRef}
          style={{
            height: '20px',
            margin: '20px 0',
            textAlign: 'center',
            display: hasMore ? 'block' : 'none'
          }}
        >
          {loading && (
            <div style={{ padding: '10px', color: 'var(--text-muted)' }}>
              Chargement...
            </div>
          )}
        </div>

        {!loading && !hasMore && posts.length > 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Vous avez tout vu !
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun post pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
