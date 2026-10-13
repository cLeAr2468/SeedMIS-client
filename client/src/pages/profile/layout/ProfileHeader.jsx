import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

const ProfileHeader = ({ user }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {user?.first_name} {user?.middle_name} {user?.last_name}
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
  );
};

export default ProfileHeader;
