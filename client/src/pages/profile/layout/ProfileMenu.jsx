import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, History, LogOut, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileMenu = ({ onDashboard, onOrderHistory, onLogout }) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      onClick: onDashboard,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Order History',
      icon: History,
      onClick: onOrderHistory,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogoutClick,
      color: 'text-red-600',
      bg: 'bg-red-50',
      isDanger: true,
    },
  ];

  return (
    <>
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={item.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simple Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-gray-600">
                  Are you sure you want to logout? You will need to login again to access your account.
                </p>
              </div>
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <Button
                onClick={() => setShowLogoutDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileMenu;
