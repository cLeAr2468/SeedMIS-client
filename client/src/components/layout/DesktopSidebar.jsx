import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sprout, Home, ShoppingBag, Package, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'Browse Seedlings', icon: ShoppingBag, path: '/shop' },
    { label: 'My Request', icon: Package, path: '/orders' },
    { label: 'Settings', icon: User, path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">Confirm Logout</p>
          <p className="text-sm text-gray-600 mt-1">
            Are you sure you want to log out?
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(t)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(t);
              try {
                await logout();
                toast.success('Logged out successfully');
                navigate('/login');
              } catch (error) {
                console.error('Logout error:', error);
                toast.error('Failed to logout');
              }
            }}
            className="flex-1"
          >
            Yes, Logout
          </Button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  return (
    <aside className="hidden lg:block w-64 bg-white border-r min-h-screen fixed left-0 top-0">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">SeedMIS</h1>
            <p className="text-sm text-gray-600">Client Portal</p>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  active
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 mt-auto"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
