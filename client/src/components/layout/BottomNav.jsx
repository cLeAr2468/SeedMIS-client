import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Package, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import notificationService from '@/services/notificationService';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        if (response.success) {
          setUnreadCount(response.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Shop', icon: ShoppingBag, path: '/shop' },
    { label: 'Requested', icon: Package, path: '/orders' },
    { label: 'Notifications', icon: Bell, path: '/notifications', badge: unreadCount },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    // Hide on desktop (lg and above)
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors relative",
                active ? "text-green-600" : "text-gray-500 active:text-green-600"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", active && "fill-green-100")} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-xs", active ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
