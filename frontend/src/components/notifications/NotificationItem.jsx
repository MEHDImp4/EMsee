import React from 'react';
import { User, Heart, Star, Gift, MoreHorizontal } from 'lucide-react';
import logo from '../../assets/logo.svg';

const getIcon = (type) => {
    switch (type) {
        case 'like':
            return <Heart size={20} fill="#F91880" color="#F91880" />;
        case 'system':
            return <div style={{ width: 20, height: 20, background: 'var(--text-main)', mask: `url(${logo}) center/contain no-repeat`, WebkitMask: `url(${logo}) center/contain no-repeat` }} />;
        case 'anniversary':
            return <Gift size={20} color="#A855F7" />;
        case 'mention':
            return <User size={20} fill="#1D9BF0" color="#1D9BF0" />;
        default:
            return <Star size={20} fill="#7C3AED" color="#7C3AED" />;
    }
};

const NotificationItem = ({ notif }) => (
    <div className={`notification-item ${!notif.read ? 'unread' : ''}`}>
        <div className="notif-icon-col">
            {notif.type === 'system' ? (
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
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {notif.text}
                    </p>
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
);

export default NotificationItem;
