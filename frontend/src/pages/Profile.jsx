import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, GraduationCap, Users, Calendar, MapPin, Edit2 } from 'lucide-react';
import './css/Profile.css';

const Profile = () => {
  const { t } = useTranslation();

  // Mock data
  const user = {
    name: "Mehdi",
    handle: "@mehdi.dev",
    role: "student",
    level: "Master 1",
    class: "Groupe B",
    email: "mehdi@example.com",
    location: "Casablanca, Maroc",
    bio: "Passionné de développement web et d'intelligence artificielle. Toujours prêt à apprendre de nouvelles technologies et à collaborer sur des projets innovants.",
    joinDate: "Septembre 2023",
    stats: {
      posts: 42,
      followers: 128,
      following: 85
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
          <div className="profile-avatar">
            {user.name.charAt(0)}
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-edit-profile">
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

        <p className="profile-bio-text">{user.bio}</p>

        <div className="profile-meta-row">
          <div className="meta-item">
            <MapPin size={16} />
            <span>{user.location}</span>
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
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.stats.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.stats.following}</span>
            <span className="stat-label">Following</span>
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
    </div>
  );
};

export default Profile;
