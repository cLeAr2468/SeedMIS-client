import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Package, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'Shop', icon: ShoppingBag, path: '/shop' },
    { label: 'Requested', icon: Package, path: '/orders' },
    { label: 'Settings', icon: User, path: '/profile' },
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
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-green-600" : "text-gray-500 active:text-green-600"
              )}
            >
              <Icon className={cn("w-6 h-6", active && "fill-green-100")} />
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
