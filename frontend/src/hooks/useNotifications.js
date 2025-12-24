import { useState, useEffect, useCallback } from 'react';
import * as NotificationService from '../services/notification.service';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);
    const { socket } = useSocket();
    const { user } = useAuth();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await NotificationService.getNotifications();
            const data = response.data || []; // Handle { data: [...] } structure
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch when user logs in
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            console.log('[DEBUG] Received new notification:', notification);
            setNotifications(prev => {
                // Prevent duplicates
                if (prev.some(n => n.id === notification.id)) return prev;
                return [notification, ...prev];
            });
            setUnreadCount(prev => prev + 1);
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }, [socket]);

    const markAsRead = async (id) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    // Client-side filtering for tabs
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'verified') return n.actor?.isVerified;
        if (activeTab === 'mentions') return n.type === 'MENTION';
        return true;
    });

    return {
        notifications,
        filteredNotifications,
        loading,
        error,
        activeTab,
        setActiveTab,
        unreadCount,
        markAsRead,
        markAllRead,
        refetch: fetchNotifications
    };
};

export default useNotifications;
