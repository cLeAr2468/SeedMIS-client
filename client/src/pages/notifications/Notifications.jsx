import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellDot, CheckCheck, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import BottomNav from '@/components/layout/BottomNav';
import notificationService from '@/services/notificationService';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const fetchNotifications = async () => {
        try {
            console.log('Fetching notifications...');
            const response = await notificationService.getAllNotifications();
            console.log('Notifications response:', response);
            
            if (response.success) {
                setNotifications(response.data || []);
                console.log('Notifications set:', response.data);
            } else {
                console.error('Response not successful:', response);
                toast.error('Failed to load notifications', {
                    description: response.message || 'Server returned unsuccessful response'
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications', {
                description: error.message || 'Please try again later'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notification) => {
        if (notification.is_read) return;

        try {
            const response = await notificationService.markAsRead(notification.id);
            if (response.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            toast.error('Failed to update notification', {
                description: error.message || 'Please try again'
            });
        }
    };

    const handleNotificationClick = async (notification) => {
        await handleMarkAsRead(notification);

        // Navigate based on notification type
        if (notification.type === 'request_status_changed' && notification.related_id) {
            navigate(`/orders`);
        } else if (notification.type === 'order_update' && notification.related_id) {
            navigate(`/orders`);
        } else {
            navigate('/orders');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast.error('Failed to update notifications', {
                description: error.message || 'Please try again'
            });
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.is_read;
        if (activeTab === 'read') return notification.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <DesktopSidebar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading notifications...</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DesktopSidebar />
            
            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 pb-20 lg:pb-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-500">
                                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 border-b">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'all'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            All {notifications.length > 0 && `(${notifications.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'unread'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Unread {unreadCount > 0 && `(${unreadCount})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('read')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'read'
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Read {(notifications.length - unreadCount) > 0 && `(${notifications.length - unreadCount})`}
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-2">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                                    !notification.is_read
                                        ? 'border-l-4 border-l-green-500 bg-green-50'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {!notification.is_read ? (
                                            <BellDot className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Bell className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-gray-900">
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <span className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {notification.message}
                                        </p>
                                        
                                        {/* Display seedling type info from relationship */}
                                        {notification.request?.inventory?.seedling_type && (
                                            <div className="mt-2 flex items-center gap-2 text-xs">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                                    {notification.request.inventory.seedling_type}
                                                </span>
                                                <span className="text-gray-600">
                                                    Qty: {notification.request.quantity}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Display rejection reason if available */}
                                        {notification.request?.rejection_reason && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                                <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                                                <p className="text-xs text-red-600 mt-0.5">{notification.request.rejection_reason}</p>
                                            </div>
                                        )}
                                        
                                        {/* Display cancellation reason if available */}
                                        {notification.request?.cancellation_reason && (
                                            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                                                <p className="text-xs font-semibold text-gray-700">Cancellation Reason:</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{notification.request.cancellation_reason}</p>
                                            </div>
                                        )}
                                        
                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Notifications;
