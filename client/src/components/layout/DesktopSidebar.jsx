import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, Home, ShoppingBag, Package, User, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const DesktopSidebar = ({ cartCount = 0, onCartClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/shop'); // Default: go to shop
    }
  };

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Browse Seeds', path: '/shop', icon: ShoppingBag },
    { label: 'My Requests', path: '/orders', icon: Package },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="hidden lg:block bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Seedling <span className="text-green-600">System</span>
              </h1>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "font-medium transition-colors flex items-center gap-2",
                    active
                      ? "text-green-600 border-b-2 border-green-600 pb-1"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Badge - Always show */}
            <button 
              onClick={handleCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Icon */}
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopSidebar;
