import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import ProfileMenu from './layout/ProfileMenu';
import ViewProfile from './layout/ViewProfile';
import EditProfile from './layout/EditProfile';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <MobileHeader title="Profile" />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="p-4 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Profile Header Inline */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user?.first_name} {user?.middle_name && !['NA', 'N/A', 'N.A', 'N.A.'].includes(user.middle_name.toUpperCase()) ? user.middle_name + ' ' : ''}{user?.last_name}
                  </h2>
                  <p className="text-gray-600 mb-2">{user?.email}</p>
                  {user?.organization && (
                    <p className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
                      {user.organization}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <ProfileMenu
                onViewProfile={() => setShowViewProfile(true)}
                onEditProfile={() => setShowEditProfile(true)}
                onOrderHistory={() => navigate('/orders')}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Modals */}
      <ViewProfile
        isOpen={showViewProfile}
        onClose={() => setShowViewProfile(false)}
        user={user}
      />
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
      />
    </div>
  );
};

export default Profile;
