import { Card, CardContent } from '@/components/ui/card';
import { User, Edit, History, LogOut, ChevronRight } from 'lucide-react';

const ProfileMenu = ({ onViewProfile, onEditProfile, onOrderHistory, onLogout }) => {
  const menuItems = [
    {
      label: 'View Profile',
      icon: User,
      onClick: onViewProfile,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Edit Profile',
      icon: Edit,
      onClick: onEditProfile,
      color: 'text-green-600',
      bg: 'bg-green-50',
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
      onClick: onLogout,
      color: 'text-red-600',
      bg: 'bg-red-50',
      isDanger: true,
    },
  ];

  return (
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
  );
};

export default ProfileMenu;
