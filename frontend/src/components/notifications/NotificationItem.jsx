import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Heart, Repeat2, MessageCircle, UserPlus, AtSign, Bell, X } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import { useTranslation } from 'react-i18next';
import './NotificationItem.css';

const NotificationItem = ({ notif, onRead, onDelete }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const type = notif.type?.toLowerCase() || 'system';

    // Handle grouped notifications
    const actors = notif.actors || (notif.actor ? [notif.actor] : []);
    const isGrouped = actors.length > 1;
    const mainActor = actors[0];
    const actorName = mainActor?.full_name || mainActor?.username || 'System';

    const handleClick = () => {
        if (!notif.read && onRead) onRead();

        if (notif.post?.id) {
            navigate(`/posts/${notif.post.id}`);
        } else if (notif.postId) {
            navigate(`/posts/${notif.postId}`);
        } else if (type === 'follow' && mainActor?.username) {
            navigate(`/profile/${mainActor.username}`);
        } else if (type === 'mention' && mainActor?.username) {
            navigate(`/profile/${mainActor.username}`);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(notif.id);
    };

    const getIcon = () => {
        const iconSize = 20;
        switch (type) {
            case 'like':
                return <Heart size={iconSize} className="notif-type-icon like" fill="#F91880" stroke="#F91880" />;
            case 'repost':
                return <Repeat2 size={iconSize} className="notif-type-icon repost" stroke="#00BA7C" />;

            case 'follow':
                return <UserPlus size={iconSize} className="notif-type-icon follow" stroke="#1D9BF0" />;
            case 'mention':
                return <AtSign size={iconSize} className="notif-type-icon mention" stroke="#7C3AED" />;
            default:
                return <Bell size={iconSize} className="notif-type-icon system" />;
        }
    };

    const getActionText = () => {
        const otherCount = actors.length - 1;
        const suffix = otherCount > 0 ? ` ${t('notifications.and_others', { count: otherCount })}` : '';

        switch (type) {
            case 'like':
                return t('notifications.liked_post', 'liked your post') + suffix;
            case 'repost':
                return t('notifications.reposted_post', 'reposted your post') + suffix;

            case 'mention':
                return t('notifications.mentioned_you', 'mentioned you') + suffix;
            case 'follow':
                return t('notifications.followed_you', 'followed you') + suffix;
            default:
                return '';
        }
    };

    const timeAgo = notif.createdAt
        ? formatDistanceToNow(new Date(notif.createdAt), {
            addSuffix: false,
            locale: i18n.language === 'fr' ? fr : enUS
        })
        : '';

    return (
        <div
            className={`notification-card ${!notif.read ? 'unread' : ''}`}
            onClick={handleClick}
        >
            {/* Left: Type Icon */}
            <div className="notif-icon-wrapper">
                {getIcon()}
            </div>

            {/* Center: Content */}
            <div className="notif-body">
                {/* Text Content */}
                <div className="notif-message">
                    <span className="notif-actor-name">{actorName}</span>
                    <span className="notif-action">{getActionText()}</span>
                </div>
            </div>

            {/* Right: Time + Delete */}
            <div className="notif-right">
                <span className="notif-time">{timeAgo}</span>
                <button
                    className="notif-delete-btn"
                    onClick={handleDelete}
                    title={t('notifications.delete', 'Delete')}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default NotificationItem;
