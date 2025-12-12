import React from 'react';
import { useTranslation } from 'react-i18next';
import useNotifications from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';

const Notifications = () => {
    const { t } = useTranslation();
    const { activeTab, setActiveTab, filteredNotifications } = useNotifications();

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
                {filteredNotifications.map((notif) => (
                    <NotificationItem key={notif.id} notif={notif} />
                ))}
            </div>
        </div>
    );
};

export default Notifications;
