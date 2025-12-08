import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, User, Heart, Star, ShieldCheck, MoreHorizontal, PartyPopper, Gift } from 'lucide-react';
import logo from '../assets/logo.svg';

const Notifications = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');

    // Mock Notifications Data
    const notifications = [
        {
            id: 1,
            type: 'like',
            user: 'Sara Bennani',
            avatar: null, // use placeholder
            text: 'a aimé votre réponse',
            content: 'Merci pour les explications sur les closures !',
            time: '2h',
            read: false
        },
        {
            id: 2,
            type: 'system',
            title: 'Nouvelle connexion detectée',
            text: 'Une connexion à votre compte @m.alami a été effectuée depuis un nouvel appareil (Windows 11).',
            time: '23h',
            read: true
        },
        {
            id: 3,
            type: 'anniversary',
            text: "C'est votre anniversaire EMsee !",
            content: "Célébrez votre 1ère année parmi nous.",
            time: '24 Nov',
            read: true
        },
        {
            id: 4,
            type: 'mention',
            user: 'Prof. Amrani',
            avatar: null,
            text: 'vous a mentionné',
            content: 'N\'oubliez pas de rendre le rapport @m.alami',
            time: '2j',
            read: true
        }
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart size={20} fill="#F91880" color="#F91880" />;
            case 'system': return <div style={{ width: 20, height: 20, background: 'var(--text-main)', mask: `url(${logo}) center/contain no-repeat`, WebkitMask: `url(${logo}) center/contain no-repeat` }} />; // fallback or custom icon
            case 'anniversary': return <Gift size={20} color="#A855F7" />;
            case 'mention': return <User size={20} fill="#1D9BF0" color="#1D9BF0" />;
            default: return <Star size={20} fill="#7C3AED" color="#7C3AED" />;
        }
    };

    const filteredNotifications = activeTab === 'all'
        ? notifications
        : activeTab === 'verified'
            ? notifications.filter(n => n.type === 'system' || n.type === 'anniversary')
            : notifications.filter(n => n.type === 'mention' || n.type === 'like');

    return (
        <div className="feed-container">
            {/* Sticky Header */}
            <div className="feed-header sticky-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
                    <h2 className="mobile-only-title" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>
                        {t('sidebar.notifications', 'Notifications')}
                    </h2>

                </div>

                <div className="feed-tabs">
                    <button
                        className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        <span>{t('notifications.tabs.all', 'Tous')}</span>
                        {activeTab === 'all' && <div className="tab-indicator" />}
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'verified' ? 'active' : ''}`}
                        onClick={() => setActiveTab('verified')}
                    >
                        <span>{t('notifications.tabs.verified', 'Vérifié')}</span>
                        {activeTab === 'verified' && <div className="tab-indicator" />}
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'mentions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mentions')}
                    >
                        <span>{t('notifications.tabs.mentions', 'Mentions')}</span>
                        {activeTab === 'mentions' && <div className="tab-indicator" />}
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="notifications-list">
                {filteredNotifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                        <div className="notif-icon-col">
                            {notif.type === 'system' ? (
                                // Use logo for system alerts like "X"
                                <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={logo} alt="System" style={{ width: 24, height: 24 }} />
                                </div>
                            ) : getIcon(notif.type)}
                        </div>

                        <div className="notif-content-col">
                            {notif.type !== 'system' && notif.type !== 'anniversary' && (
                                <div className="notif-avatar-row">
                                    <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                        {notif.user ? notif.user.charAt(0) : 'U'}
                                    </div>
                                </div>
                            )}

                            <div className="notif-text">
                                {notif.type === 'system' ? (
                                    <>
                                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>
                                            {notif.text}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontWeight: 700 }}>{notif.user || notif.title}</span>
                                        <span style={{ color: 'var(--text-muted)' }}> {notif.text}</span>
                                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {notif.content}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="notif-action-col">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <button className="more-options-btn"><MoreHorizontal size={16} /></button>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
