import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, Bell, Bookmark, Users, Settings, LogOut } from 'lucide-react';
import logo from '../assets/logo.svg';

const Sidebar = () => {
    const { t } = useTranslation();

    const navItems = [
        { icon: Home, label: t('sidebar.home', 'Accueil'), path: '/feed' },
        { icon: Compass, label: t('sidebar.explore', 'Explorer'), path: '/explore' },
        { icon: Bell, label: t('sidebar.notifications', 'Notifications'), path: '/notifications' },
        { icon: Bookmark, label: t('sidebar.bookmarks', 'Signets'), path: '/bookmarks' },
        { icon: Users, label: t('sidebar.community', 'Communauté'), path: '/community' },
        { icon: Settings, label: t('sidebar.settings', 'Paramètres'), path: '/settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="logo-area">
                <img src={logo} alt="Logo" style={{ width: 32, height: 32 }} />
                <span>ProjetJS</span>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={24} />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="user-area" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }}
                    className="nav-item"
                    style={{ width: '100%', marginBottom: '1rem', color: 'var(--danger)', justifyContent: 'flex-start' }}
                >
                    <LogOut size={24} />
                    <span>{t('sidebar.logout', 'Déconnexion')}</span>
                </button>

                {/* Placeholder for user profile at bottom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-main)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>
                        MA
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Mohammed Alami</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@m.alami.emsi</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
