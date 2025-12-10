
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, GraduationCap, Users, Calendar, MapPin, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './css/Profile.css';
import EditProfileModal from '../components/profile/EditProfileModal';

const Profile = () => {
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock data
  const { user: authUser } = useAuth();

  // Guard clause if no user (should rely on ProtectedRoute but good practice)
  if (!authUser) return null;

  const user = {
    name: authUser.full_name || authUser.name || "User",
    handle: `@${authUser.username || 'user'}`,
    role: authUser.role || "student",
    // Map backend fields to display fields
    level: authUser.year ? t(`lists.years.${authUser.year}`) : "N/A",
    class: authUser.filiere ? t(`lists.filieres.${authUser.filiere}`) : "N/A",
    email: authUser.email,
    // Use empty string defaults if bio/location are missing, as requested
    location: authUser.location || "",
    bio: authUser.bio || "",
    joinDate: new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    avatar: authUser.avatar ? `http://localhost:5000${authUser.avatar}` : null,
    stats: {
      posts: 0,
      followers: 0,
      following: 0
    }
  };

  return (
    <div className="profile-container">
      {/* Banner Section */}
      <div className="profile-banner">
        <div className="banner-gradient"></div>
      </div>

      {/* Header Section with Avatar */}
      <div className="profile-header-content">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar" style={user.avatar ? { padding: 0 } : {}}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-edit-profile" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 size={16} />
            <span>{t('profile.edit', 'Modifier')}</span>
          </button>
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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
