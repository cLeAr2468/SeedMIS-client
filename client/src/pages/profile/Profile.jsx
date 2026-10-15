import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Building2, Phone, MapPin, Calendar, Edit, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import ProfileMenu from './layout/ProfileMenu';
import EditProfile from './layout/EditProfile';
import ChangePassword from './layout/ChangePassword';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Update currentUser whenever user changes from context
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    // Update the local state immediately
    setCurrentUser(updatedUser);
    
    // Update the user in context
    if (updateUser) {
      updateUser(updatedUser);
    }
    
    // Close the modal
    setShowEditProfile(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <MobileHeader title="Profile" />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Enhanced Profile Header with Full Info */}
            <Card className="mb-6">
              <CardContent className="pt-6 pb-6">
                {/* Avatar and Basic Info with Edit Button */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {currentUser?.first_name} {currentUser?.middle_name && !['NA', 'N/A', 'N.A', 'N.A.'].includes(currentUser.middle_name.toUpperCase()) ? currentUser.middle_name + ' ' : ''}{currentUser?.last_name}{currentUser?.suffix ? ' ' + currentUser.suffix : ''}
                      </h2>
                      <div className="flex gap-2 mx-auto lg:mx-0">
                        <Button
                          onClick={() => setShowEditProfile(true)}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-white"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </Button>
                        <Button
                          onClick={() => setShowChangePassword(true)}
                          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white"
                          size="sm"
                        >
                          <Lock className="w-4 h-4" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                    {currentUser?.organization && (
                      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-4">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">{currentUser.organization}</span>
                      </div>
                    )}
                    {currentUser?.client_id && (
                      <p className="text-sm text-gray-500">Client ID: {currentUser.client_id}</p>
                    )}
                  </div>
                </div>

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {currentUser?.contact_number && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                        <p className="text-sm font-medium text-gray-900">{currentUser.contact_number}</p>
                      </div>
                    </div>
                  )}

                  {currentUser?.region && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Region</p>
                        <p className="text-sm font-medium text-gray-900">{currentUser.region}</p>
                      </div>
                    </div>
                  )}

                  {(currentUser?.barangay || currentUser?.municipality || currentUser?.province) && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Complete Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {[currentUser.purok, currentUser.barangay, currentUser.municipality, currentUser.province].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentUser?.created_at && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Member Since</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(currentUser.created_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Actions Menu */}
            <div className="mt-6">
              <ProfileMenu
                onDashboard={() => navigate('/dashboard')}
                onOrderHistory={() => navigate('/orders')}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Change Password Modal */}
      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        user={currentUser}
      />
    </div>
  );
};

export default Profile;
