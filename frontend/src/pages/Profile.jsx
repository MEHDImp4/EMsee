import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, GraduationCap, Users, Calendar, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './css/Profile.css';
import EditProfileModal from '../components/profile/EditProfileModal';
import PostCard from '../components/PostCard';
import useProfilePage from '../hooks/useProfilePage';

const Profile = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const { user: authUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const targetUsername = username || authUser?.username;

  const {
    profileData,
    userPosts,
    loadingPosts,
    loadingProfile,
    isOwner,
    userView,
    handleDeletePost,
    toggleFollow
  } = useProfilePage({ targetUsername, authUser });

  if (!authUser && !targetUsername) return null;
  if (loadingProfile && !profileData) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Profile...</div>;
  if (!profileData) return <div style={{ padding: '20px', textAlign: 'center' }}>User not found</div>;

  const user = userView ? {
    ...userView,
    level: userView.level ? t(`lists.years.${userView.level}`) : 'N/A',
    class: userView.class ? t(`lists.filieres.${userView.class}`) : 'N/A',
    joinDate: userView.joinDate ? new Date(userView.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : ''
  } : null;

  return (
    <div className="profile-container">
      {/* Banner Section */}
      <div className="profile-banner">
        <div className="banner-gradient"></div>
      </div>

      {/* Header Section with Avatar */}
      <div className="profile-header-content">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar" style={user.avatar ? { padding: 0, overflow: 'hidden' } : {}}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (user.name || 'U').charAt(0)
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isOwner ? (
            <button className="btn-edit-profile" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} />
              <span>{t('profile.edit', 'Modifier')}</span>
            </button>
          ) : (
            <button
              className={`btn-follow ${profileData.isFollowing ? 'following' : ''}`}
              onClick={toggleFollow}
              style={{
                padding: '8px 24px',
                borderRadius: '20px',
                border: profileData.isFollowing ? '1px solid var(--border)' : 'none',
                background: profileData.isFollowing ? 'transparent' : 'var(--primary)',
                color: profileData.isFollowing ? 'var(--text-main)' : 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {profileData.isFollowing ? t('profile.following', 'Abonné') : t('profile.follow', 'Suivre')}
            </button>
          )}
        </div>

        <div className="profile-identity">
          <h1 className="profile-name">
            {user.name}
            <span className="profile-role-badge">{t(`auth.${user.role}`)}</span>
          </h1>
          <p className="profile-handle">{user.handle}</p>
        </div>

        <p className="profile-bio-text">{user.bio || t('profile.no_bio', 'No bio yet.')}</p>

        <div className="profile-meta-row">
          {user.location && (
            <div className="meta-item">
              <MapPin size={16} />
              <span>{user.location}</span>
            </div>
          )}
          <div className="meta-item">
            <Mail size={16} />
            <span>{user.email}</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} />
            <span>{t('profile.joined')} {user.joinDate}</span>
          </div>
        </div>

        <div className="profile-stats-row">
          <div className="stat-item">
            <span className="stat-value">{user.stats.posts}</span>
            <span className="stat-label">{t('profile.posts', 'Posts')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.stats.followers}</span>
            <span className="stat-label">{t('profile.followers', 'Abonnés')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.stats.following}</span>
            <span className="stat-label">{t('profile.following', 'Abonnements')}</span>
          </div>
        </div>
      </div>

      {/* Academic Info Cards */}
      <div className="profile-grid">
        <div className="info-card">
          <div className="card-icon-wrapper blue">
            <GraduationCap size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">{t('profile.level')}</span>
            <span className="card-value">{user.level}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon-wrapper green">
            <Users size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">{t('profile.class')}</span>
            <span className="card-value">{user.class}</span>
          </div>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="profile-posts-section">
        <div className="section-title" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
          {t('profile.posts', 'Posts')}
        </div>
        <div className="posts-list">
          {loadingPosts ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : userPosts?.length > 0 ? (
            userPosts.map((post, index) => (
              <PostCard key={`${post.id}-${index}`} post={post} onDelete={handleDeletePost} />
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#8899a6' }}>
              No posts yet.
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
