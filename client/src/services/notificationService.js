import api from './api';

const notificationService = {
    // Get all notifications
    getAllNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to fetch notifications' };
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to fetch unread count' };
        }
    },

    // Mark as read
    markAsRead: async (id) => {
        try {
            const response = await api.post(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to mark as read' };
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            const response = await api.post('/notifications/read-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to mark all as read' };
        }
    },
};

export default notificationService;
