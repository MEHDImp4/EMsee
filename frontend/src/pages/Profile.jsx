import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, GraduationCap, Users, Calendar, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './css/Profile.css';
import EditProfileModal from '../components/profile/EditProfileModal';
import PostCard from '../components/PostCard';
import UserAvatar from '../components/UserAvatar';
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
    activeTab,
    setActiveTab,
    handleDeletePost,
    toggleFollow
  } = useProfilePage({ targetUsername, authUser });

  if (!authUser && !targetUsername) return null;
  if (loadingProfile && !profileData) return <div style={{ padding: '20px', textAlign: 'center' }}>{t('profile.loading_profile', 'Loading Profile...')}</div>;
  if (!profileData) return <div style={{ padding: '20px', textAlign: 'center' }}>{t('profile.user_not_found', 'User not found')}</div>;

  const user = userView ? {
    ...userView,
    level: userView.level ? t(`lists.years.${userView.level}`) : t('common.na', 'N/A'),
    filiere: userView.filiere ? t(`lists.filieres.${userView.filiere}`) : t('common.na', 'N/A'),
    class: userView.class || t('common.na', 'N/A'),
    joinDate: userView.joinDate ? new Date(userView.joinDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : ''
  } : null;

  return (
    <div className="profile-container">
      {/* Banner Section */}
      <div className="profile-banner">
        {user.banner ? (
          <div className="banner-image" style={{ backgroundImage: `url(${user.banner})` }}></div>
        ) : (
          <div className="banner-gradient"></div>
        )}
      </div>

      {/* Header Section with Avatar */}
      <div className="profile-header-content">
        <div className="profile-avatar-wrapper">
          <UserAvatar
            user={user}
            size={140}
            className="profile-avatar-component"
          />
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
          <div className="meta-item">
              <MapPin size={16} />
              <span>{user.location || t('profile.default_location', 'Rabat, Morocco')}</span>
            </div>
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
        {user.role === 'professor' ? (
          // For professors: Show subjects taught
          <div className="info-card">
            <div className="card-icon-wrapper blue">
              <GraduationCap size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">{t('auth.subjects_taught')}</span>
              <span className="card-value">
                {user.subjects && user.subjects.length > 0
                  ? user.subjects.map((subject) => t(`lists.subjects.${subject}`) || subject).join(', ')
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        ) : (
          // For students: Show filiere, level, class
          <>
            <div className="info-card">
              <div className="card-icon-wrapper blue">
                <GraduationCap size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">{t('auth.field_of_study')}</span>
                <span className="card-value">{user.filiere}</span>
              </div>
            </div>

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
          </>
        )}
      </div>

      {/* User Posts Section with Tabs */}
      <div className="profile-posts-section">
        <div className="profile-tabs">
          <button
            className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            {t('profile.tabs.posts', 'Posts')}
          </button>
          <button
            className={`tab-item ${activeTab === 'reposts' ? 'active' : ''}`}
            onClick={() => setActiveTab('reposts')}
          >
            {t('profile.tabs.reposts', 'Reposts')}
          </button>
          {isOwner && (
            <button
              className={`tab-item ${activeTab === 'likes' ? 'active' : ''}`}
              onClick={() => setActiveTab('likes')}
            >
              {t('profile.tabs.likes', 'J\'aime')}
            </button>
          )}
        </div>

        <div className="posts-list">
          {loadingPosts ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading', 'Loading...')}</div>
          ) : userPosts?.length > 0 ? (
            userPosts.map((post, index) => (
              <PostCard key={`${post.id}-${index}`} post={post} onDelete={handleDeletePost} />
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#8899a6' }}>
              {activeTab === 'posts' && t('profile.empty_posts', 'No posts yet.')}
              {activeTab === 'reposts' && t('profile.empty_reposts', 'No reposts yet.')}
              {activeTab === 'likes' && t('profile.empty_likes', 'No liked posts yet.')}
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
