import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, BarChart2, Code, Smile, Send } from 'lucide-react';

const Feed = () => {
  const { t } = useTranslation();

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
      {/* Header */}
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('sidebar.home', 'Accueil')}</h2>
        <div className="tabs" style={{ background: 'var(--bg-sidebar)', padding: '0.2rem', borderRadius: '99px' }}>
          <button className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Pour vous</button>
          <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ma Classe</button>
        </div>
      </div>

      {/* Share Box */}
      <div className="share-box">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>MA</div>
          <div style={{ flex: 1 }}>
            <textarea
              placeholder="Quoi de neuf à l'EMSI ?"
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', resize: 'none', fontSize: '1.1rem', outline: 'none', minHeight: '60px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--primary)' }}>
                <Image size={20} style={{ cursor: 'pointer' }} />
                <BarChart2 size={20} style={{ cursor: 'pointer' }} />
                <Code size={20} style={{ cursor: 'pointer' }} />
                <Smile size={20} style={{ cursor: 'pointer' }} />
              </div>
              <button className="btn" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                Publier <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: post.isProf ? '#10B981' : '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                {post.user.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{post.user}</span>
                {post.isProf && <span style={{ background: '#374151', color: '#D1D5DB', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', verticalAlign: 'middle' }}>Professeur</span>}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{post.handle} · {post.time}</div>
              </div>
            </div>

            <p style={{ lineHeight: '1.5', marginBottom: '1rem' }}>{post.content}</p>

            {post.code && (
              <div style={{ background: '#0d1117', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', overflowX: 'auto', marginBottom: '1rem', border: '1px solid #30363d' }}>
                <pre style={{ margin: 0, color: '#c9d1d9' }}>{post.code}</pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>💬 {post.comments}</span>
              <span>🔄 12</span>
              <span>❤️ {post.likes}</span>
              <span>📊</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
