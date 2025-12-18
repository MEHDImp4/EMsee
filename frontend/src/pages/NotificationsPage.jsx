import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Bell, Heart, Repeat2, MessageCircle, User, Star, ShieldCheck } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import './css/NotificationsPage.css';

const NotificationsPage = () => {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'verified', 'mentions'

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.data);

            // Mark all valid notifications as read
            await api.post('/notifications/mark-all-read');
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <Heart className="notification-icon like" size={20} fill="var(--accent-red)" />;
            case 'REPOST': return <Repeat2 className="notification-icon repost" size={20} />;
            case 'COMMENT': return <MessageCircle className="notification-icon comment" size={20} fill="var(--accent-blue)" />;
            case 'MENTION': return <User className="notification-icon mention" size={20} />;
            case 'Follow': return <User className="notification-icon follow" size={20} />;
            case 'SYSTEM': return <ShieldCheck className="notification-icon system" size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'mentions') return n.type === 'MENTION';
        if (filter === 'verified') return n.actor?.role === 'admin' || n.actor?.role === 'professor'; // Mock verification
        return true;
    });

    return (
        <div className="notifications-page">
            <header className="page-header sticky">
                <h2>{t('notifications.title', 'Notifications')}</h2>
                <div className="tabs">
                    <button
                        className={`tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        {t('notifications.all', 'All')}
                    </button>
                    <button
                        className={`tab ${filter === 'verified' ? 'active' : ''}`}
                        onClick={() => setFilter('verified')}
                    >
                        {t('notifications.verified', 'Verified')}
                    </button>
                    <button
                        className={`tab ${filter === 'mentions' ? 'active' : ''}`}
                        onClick={() => setFilter('mentions')}
                    >
                        {t('notifications.mentions', 'Mentions')}
                    </button>
                </div>
            </header>

            <div className="notifications-list">
                {loading ? (
                    <div className="loading-spinner">{t('common.loading', 'Loading...')}</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>{t('notifications.empty', 'No notifications yet')}</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                            <div className="notification-icon-col">
                                {getIcon(notification.type)}
                            </div>
                            <div className="notification-content-col">
                                <div className="notification-user-avatar">
                                    {notification.actor?.avatar ? (
                                        <img src={`${BASE_URL}${notification.actor.avatar}`} alt={notification.actor.username} />
                                    ) : (
                                        <div className="avatar-placeholder">{notification.actor?.username?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="notification-text">
                                    <span className="user-name">{notification.actor?.full_name || notification.actor?.username}</span>
                                    {' '}
                                    <span className="action-text">
                                        {notification.type === 'LIKE' && t('notifications.liked_post', 'liked your post')}
                                        {notification.type === 'REPOST' && t('notifications.reposted_post', 'reposted your post')}
                                        {notification.type === 'COMMENT' && t('notifications.commented_post', 'commented on your post')}
                                        {notification.type === 'MENTION' && t('notifications.mentioned_you', 'mentioned you')}
                                        {notification.type === 'SYSTEM' && t('notifications.system_alert', 'System Alert')}
                                    </span>
                                    {notification.preview && (
                                        <div className="notification-preview">
                                            {notification.preview}
                                        </div>
                                    )}
                                </div>
                                <span className="notification-time">
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                        addSuffix: true,
                                        locale: i18n.language === 'fr' ? fr : enUS
                                    })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
