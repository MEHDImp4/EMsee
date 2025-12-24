import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useNotifications from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab, filteredNotifications, markAllRead, markAsRead } = useNotifications();
    const { socket } = useSocket();
    const { user } = useAuth();

    // Socket Status State
    const [socketStatus, setSocketStatus] = useState('Checking...');
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        if (!socket) {
            setSocketStatus('No Socket');
            return;
        }

        const updateStatus = () => {
            setSocketStatus(socket.connected ? 'Connected' : 'Disconnected');
            setSocketId(socket.id);
        };

        socket.on('connect', updateStatus);
        socket.on('disconnect', updateStatus);

        // Initial check
        updateStatus();

        return () => {
            socket.off('connect', updateStatus);
            socket.off('disconnect', updateStatus);
        };
    }, [socket]);

    return (
        <div className="feed-container">
            {/* Sticky Header */}
            <div className="feed-header sticky-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 className="mobile-only-title" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800 }}>
                            {t('sidebar.notifications', 'Notifications')}
                        </h2>
                        {/* DEBUG: Visible Status */}
                        <div style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#222', color: '#ccc', borderRadius: '4px', marginTop: '4px', borderLeft: `3px solid ${socketStatus === 'Connected' ? '#4caf50' : '#f44336'}` }}>
                            <strong>Status:</strong> <span style={{ color: socketStatus === 'Connected' ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>{socketStatus}</span> |
                            <strong> Port:</strong> 5001 |
                            <strong> ID:</strong> {user?.id}
                        </div>
                    </div>
                    <button
                        onClick={markAllRead}
                        className="mark-read-btn"
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        {t('notifications.mark_all_read', 'Tout marquer comme lu')}
                    </button>
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
                {filteredNotifications.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        No notifications (User {user?.id})
                    </div>
                )}
                {filteredNotifications.map((notif) => (
                    <NotificationItem
                        key={notif.id}
                        notif={notif}
                        onRead={() => markAsRead(notif.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Notifications;
