import api from './api';

const notificationService = {
    // Get all notifications
    getAllNotifications: async () => {
        try {
            // Get user info from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;
            const userType = 'client'; // Client-side always uses 'client' type
            
            if (!userId) {
                throw new Error('User not authenticated');
            }
            
            const response = await api.get('/notifications', {
                params: {
                    user_id: userId,
                    user_type: userType
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to fetch notifications' };
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            // Get user info from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;
            const userType = 'client'; // Client-side always uses 'client' type
            
            if (!userId) {
                throw new Error('User not authenticated');
            }
            
            const response = await api.get('/notifications/unread-count', {
                params: {
                    user_id: userId,
                    user_type: userType
                }
            });
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
            // Get user info from localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;
            const userType = 'client'; // Client-side always uses 'client' type
            
            if (!userId) {
                throw new Error('User not authenticated');
            }
            
            const response = await api.post('/notifications/read-all', {
                user_id: userId,
                user_type: userType
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to mark all as read' };
        }
    },
};

export default notificationService;
