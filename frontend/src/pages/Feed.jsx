import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, BarChart2, Code, Smile, Send, MessageCircle, Repeat, Heart, Share, Globe, CalendarClock, MapPin } from 'lucide-react';

const Feed = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('foryou');

  // Mock data
  const posts = [
    {
      id: 1,
      user: 'Prof. Amrani',
      handle: '@amrani.prof',
      time: '2h',
      content: 'Rappel : le projet #ProjetWeb est à rendre avant vendredi ! N\'oubliez pas la documentation technique. Bon courage à tous 💪',
      likes: 45,
      comments: 8,
      isProf: true
    },
    {
      id: 2,
      user: 'Sara Bennani',
      handle: '@s.bennani',
      time: '4h',
      content: "Quelqu'un peut m'expliquer les closures en JavaScript ? Je bloque sur le TD... @m.alami.emsi t'as compris toi ?",
      code: `function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}`,
      likes: 12,
      comments: 4,
      isProf: false
    }
  ];

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
          <div className="avatar-circle">MA</div>
        </div>
        <div className="compose-content">
          <textarea
            placeholder={t('feed.placeholder', "Quoi de neuf à l'EMSI ?")}
            className="compose-input"
            rows="3"
          />

          <div className="compose-reply-permission">
            <span className="permission-icon"><Globe size={16} /></span>
            <span className="permission-text">{t('feed.everyone_can_reply', 'Tout le monde peut répondre')}</span>
          </div>

          <div className="compose-actions">
            <div className="compose-icons">
              <button className="icon-btn" title="Media"><Image size={20} /></button>
              <button className="icon-btn" title="Poll"><BarChart2 size={20} /></button>
              <button className="icon-btn" title="Code"><Code size={20} /></button>
              <button className="icon-btn" title="Emoji"><Smile size={20} /></button>
            </div>
            <button className="post-btn-small">
              {t('sidebar.publish', 'Publier')}
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-avatar-col">
              <div className="avatar-circle">
                {post.user.charAt(0)}
              </div>
            </div>

            <div className="post-content-col" style={{ flex: 1 }}>
              <div className="post-header">
                <div className="post-info-row">
                  <span className="post-name">{post.user}</span>
                  <span className="post-handle">{post.handle}</span>
                  <span className="post-dot">·</span>
                  <span className="post-time">{post.time}</span>
                  {post.isProf && <span className="prof-badge">Professeur</span>}
                </div>
                <button className="more-options-btn">•••</button>
              </div>

              <div className="post-text">
                {post.content}
              </div>

              {post.code && (
                <div className="code-block">
                  <pre>{post.code}</pre>
                </div>
              )}

              <div className="post-actions">
                <button className="action-btn comment">
                  <div className="icon-wrapper"><MessageCircle size={18} /></div>
                  <span>{post.comments}</span>
                </button>
                <button className="action-btn retweet">
                  <div className="icon-wrapper"><Repeat size={18} /></div>
                  <span>0</span>
                </button>
                <button className="action-btn like">
                  <div className="icon-wrapper"><Heart size={18} /></div>
                  <span>{post.likes}</span>
                </button>
                <button className="action-btn share">
                  <div className="icon-wrapper"><Share size={18} /></div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
