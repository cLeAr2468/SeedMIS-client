import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, User, Mail, Phone, Building2, MapPin } from 'lucide-react';

const ViewProfile = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const fields = [
    { label: 'Client ID', value: user?.client_id, icon: User },
    { label: 'First Name', value: user?.first_name, icon: User },
    { label: 'Middle Name', value: user?.middle_name, icon: User },
    { label: 'Last Name', value: user?.last_name, icon: User },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Contact Number', value: user?.contact_number, icon: Phone },
    { label: 'Organization', value: user?.organization, icon: Building2 },
    { label: 'Barangay', value: user?.barangay, icon: MapPin },
    { label: 'Municipality', value: user?.municipality, icon: MapPin },
    { label: 'Province', value: user?.province, icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle>Profile Information</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {fields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 mb-1">{field.label}</p>
                      <p className="font-medium text-gray-900">{field.value || 'Not provided'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewProfile;
