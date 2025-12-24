import api from './api';

/**
 * Get user notifications
 */
export const getNotifications = (page = 1, limit = 20) => {
    return api.get('/notifications', { params: { page, limit } });
};

/**
 * Mark notification as read
 */
export const markAsRead = (id) => {
    return api.patch(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = () => {
    return api.post('/notifications/mark-all-read');
};
