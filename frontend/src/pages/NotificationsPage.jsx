import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import api from '../services/api';
import './css/NotificationsPage.css';
import NotificationItem from '../components/notifications/NotificationItem';
import { useSocket } from '../context/SocketContext'; // Import useSocket

const NotificationsPage = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'verified', 'mentions'
    const { socket } = useSocket(); // Get socket instance

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Socket listener for real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data || []);

            // Mark all valid notifications as read
            await api.post('/notifications/mark-all-read');
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id) => {
        // Ideally mark specific notification as read if not already
        // api.patch(`/notifications/${id}/read`);
        // For now, local state update if needed, but we marked all read on load
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const filteredNotifications = (notifications || []).filter(n => {
        if (filter === 'mentions') return n.type === 'MENTION';
        if (filter === 'likes') return n.type === 'LIKE';
        return true;
    });

    // Group adjacent notifications
    const groupedNotifications = (() => {
        const grouped = [];
        filteredNotifications.forEach(n => {
            const last = grouped[grouped.length - 1];

            const isSameType = last && last.type === n.type;
            const isSamePost = last && last.postId === n.postId;
            const canGroup = ['LIKE', 'REPOST', 'FOLLOW'].includes(n.type);

            if (canGroup && isSameType && (n.type === 'FOLLOW' || isSamePost)) {
                if (!last.actors) last.actors = [last.actor];
                // Avoid duplicate actors in same group
                if (!last.actors.some(a => a?.id === n.actor?.id)) {
                    last.actors.push(n.actor);
                }
            } else {
                grouped.push({ ...n, actors: n.actor ? [n.actor] : [] });
            }
        });
        return grouped;
    })();

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
                        className={`tab ${filter === 'likes' ? 'active' : ''}`}
                        onClick={() => setFilter('likes')}
                    >
                        {t('notifications.likes', 'Likes')}
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
                ) : groupedNotifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>{t('notifications.empty', 'No notifications yet')}</p>
                    </div>
                ) : (
                    groupedNotifications.map((notification, index) => (
                        <NotificationItem
                            key={notification.id || index}
                            notif={notification}
                            onRead={() => handleRead(notification.id)}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
