import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, BarChart2, Code, Smile, Globe, Users, Lock } from 'lucide-react';
import PostCard from '../components/PostCard';
import PostService from '../services/post.service';
import { useAuth } from '../context/AuthContext';
import './css/Feed.css';

const Feed = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('foryou');
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyPermission, setReplyPermission] = useState('EVERYONE');
  const [showPermissionMenu, setShowPermissionMenu] = useState(false);
  const permissionMenuRef = React.useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (permissionMenuRef.current && !permissionMenuRef.current.contains(event.target)) {
        setShowPermissionMenu(false);
      }
    };

    if (showPermissionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPermissionMenu]);

  const fetchPosts = async () => {
    try {
      const data = await PostService.getAllPosts();
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;

    try {
      const newPost = await PostService.createPost(newPostContent, replyPermission);
      // newPost from create API might not have all the _count and user fields populated as deeply as getAllPosts
      // But our controller returns include user.
      // We might need to manually add structured fields for optimistic update or just simple structure
      const optimizedPost = {
        ...newPost,
        _count: { likes: 0, comments: 0, reposts: 0 },
        isLiked: false,
        isReposted: false
      };
      setPosts([optimizedPost, ...posts]);
      setNewPostContent('');
      setReplyPermission('EVERYONE');
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };

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
            <span>{t('feed.tabs.class', 'Ma Classe')}</span>
            {activeTab === 'class' && <div className="tab-indicator" />}
          </button>
        </div>
      </div>

      {/* Compose Area */}
      <div className="compose-area">
        <div className="compose-avatar">
          <div className="avatar-circle">
            {user?.avatar ?
              <img src={`http://localhost:5000${user.avatar}`} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : (user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U')}
          </div>
        </div>
        <div className="compose-content">
          <textarea
            placeholder={t('feed.placeholder', "Quoi de neuf à l'EMSI ?")}
            className="compose-input"
            rows="3"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostSubmit();
              }
            }}
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
              <button className="icon-btn" title="Media"><Image size={20} /></button>
              <button className="icon-btn" title="Poll"><BarChart2 size={20} /></button>
              <button className="icon-btn" title="Code"><Code size={20} /></button>
              <button className="icon-btn" title="Emoji"><Smile size={20} /></button>
            </div>
            <button className="post-btn-small" onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
              {t('sidebar.publish', 'Publier')}
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : (
          posts?.map((post, index) => (
            <PostCard key={`${post.id}-${index}`} post={post} onDelete={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
