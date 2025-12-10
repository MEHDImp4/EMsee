import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, Bell, Bookmark, Users, Settings, LogOut, PenTool, MessageSquare } from 'lucide-react';
import logo from '../assets/logo.svg';
import LogoutModal from './LogoutModal';
import ComposeModal from './ComposeModal';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showComposeModal, setShowComposeModal] = useState(false);

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const userName = user?.full_name || user?.name || 'User';
    const userHandle = user?.username ? `@${user.username}` : '@user';
    const userInitials = getInitials(userName);
    const avatarUrl = user?.avatar ? `http://localhost:5000${user.avatar}` : null;

    const navItems = [
        { icon: Home, label: t('sidebar.home', 'Accueil'), path: '/feed', hideOnMobile: true },
        { icon: Compass, label: t('sidebar.explore', 'Explorer'), path: '/explore', hideOnMobile: true },
        { icon: MessageSquare, label: t('sidebar.messages', 'Messages'), path: '/messages', hideOnMobile: true },
        { icon: Bell, label: t('sidebar.notifications', 'Notifications'), path: '/notifications', hideOnMobile: true },
        { icon: Bookmark, label: t('sidebar.bookmarks', 'Signets'), path: '/bookmarks' },
        { icon: Users, label: t('sidebar.community', 'Communauté'), path: '/community' },
        { icon: Settings, label: t('sidebar.settings', 'Paramètres'), path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <aside className={`sidebar ${isOpen ? 'drawer-open' : ''}`}>
            {/* Drawer Header for mobile */}
            <div className="drawer-header mobile-only">
                <div className="drawer-profile-info">
                    <div className="avatar-circle-large" style={avatarUrl ? { padding: 0, overflow: 'hidden' } : {}}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            userInitials
                        )}
                    </div>
                    <div className="drawer-user-details">
                        <span className="drawer-name">{userName}</span>
                        <span className="drawer-handle">{userHandle}</span>
                    </div>
                    <div className="drawer-stats">
                        <div className="stat-item">
                            <span className="stat-value">142</span>
                            <span className="stat-label">{t('profile.following', 'Abonnements')}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">584</span>
                            <span className="stat-label">{t('profile.followers', 'Abonnés')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sidebar-content">
                <div className="logo-area desktop-only">
                    <Link to="/feed" className="logo-circle">
                        <img src={logo} alt="Logo" style={{ width: 38, height: 38 }} />
                    </Link>
                </div>

                <nav className="main-nav">
                    <ul className="nav-list">
                        {navItems.map((item) => (
                            <li key={item.path} className={item.hideOnMobile ? 'desktop-only' : ''}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    onClick={onClose} /* Close drawer on click */
                                >
                                    <item.icon size={26} strokeWidth={2.5} />
                                    <span className="nav-label">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    className="post-btn-large desktop-only"
                    onClick={() => setShowComposeModal(true)}
                >
                    <span className="post-btn-text">{t('sidebar.publish', 'Publier')}</span>
                    <span className="post-btn-icon"><PenTool size={24} /></span>
                </button>

                <div className="user-area-container desktop-only">
                    <div className="user-profile-card">
                        <NavLink
                            to="/profile"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                flex: 1,
                                textDecoration: 'none',
                                color: 'inherit',
                                overflow: 'hidden'
                            }}
                        >
                            <div className="avatar-circle" style={avatarUrl ? { padding: 0, overflow: 'hidden' } : {}}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    userInitials
                                )}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{userName}</div>
                                <div className="user-handle">{userHandle}</div>
                            </div>
                        </NavLink>

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="logout-btn-mini"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            title={t('sidebar.logout', 'Déconnexion')}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Mobile Logout Button (at bottom of drawer list) */}
                <div className="mobile-only" style={{ marginTop: 'auto' }}>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="nav-item"
                        style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                    >
                        <LogOut size={26} />
                    </button>
                </div>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />

            <ComposeModal
                isOpen={showComposeModal}
                onClose={() => setShowComposeModal(false)}
            />
        </aside>
    );
};

export default Sidebar;
