import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { AddressSelector } from '@/components/ui/address-selector';
import { Select } from '@/components/ui/select';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const EditProfile = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  
  const [formData, setFormData] = React.useState({
    client_id: '',
    organization: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    contact_number: '',
    purok: '',
    barangay: '',
    municipality: '',
    province: '',
    region: '',
    status: '',
  });

  // Load user data when dialog opens
  React.useEffect(() => {
    if (isOpen && user) {
      setFormData({
        client_id: user.client_id || '',
        organization: user.organization || '',
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        purok: user.purok || '',
        barangay: user.barangay || '',
        municipality: user.municipality || '',
        province: user.province || '',
        region: user.region || '',
        status: user.status || 'Active',
      });
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    const fieldMapping = {
      'client-id': 'client_id',
      'organization': 'organization',
      'first-name': 'first_name',
      'middle-name': 'middle_name',
      'last-name': 'last_name',
      'suffix': 'suffix',
      'email': 'email',
      'contact-number': 'contact_number',
      'purok': 'purok',
      'status': 'status',
    };
    
    const stateKey = fieldMapping[id] || id;
    
    let processedValue = value;
    
    // For name fields, only allow letters and spaces
    if (id === 'first-name' || id === 'middle-name' || id === 'last-name') {
      processedValue = value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    }
    // For contact number, format Philippine phone number
    else if (id === 'contact-number') {
      let cleaned = value.replace(/[^\d+]/g, '');
      
      if (cleaned.startsWith('+63')) {
        cleaned = cleaned.substring(0, 13);
      } else if (cleaned.startsWith('09')) {
        cleaned = cleaned.substring(0, 11);
      } else if (cleaned.startsWith('9')) {
        cleaned = '0' + cleaned;
        cleaned = cleaned.substring(0, 11);
      } else if (cleaned.startsWith('+6')) {
        cleaned = cleaned.substring(0, 13);
      } else if (cleaned.startsWith('63') && cleaned.length > 2) {
        cleaned = '+' + cleaned;
        cleaned = cleaned.substring(0, 13);
      } else {
        cleaned = cleaned.substring(0, 11);
      }
      
      processedValue = cleaned;
    }
    else if (id === 'purok') {
      processedValue = value.toUpperCase();
    }
    else if (id === 'email' || id === 'status') {
      // Don't uppercase email or status fields
      processedValue = value;
    }
    else {
      processedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [stateKey]: processedValue
    }));
    
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.client_id) newErrors['client-id'] = "Client ID is required";
    if (!formData.organization) newErrors['organization'] = "Organization is required";
    if (!formData.first_name) newErrors['first-name'] = "First name is required";
    if (!formData.last_name) newErrors['last-name'] = "Last name is required";
    if (!formData.email) newErrors['email'] = "Email is required";
    
    // Phone validation
    if (!formData.contact_number) {
      newErrors['contact-number'] = "Contact number is required";
    } else {
      const phone = formData.contact_number;
      if (phone.startsWith('+63')) {
        if (phone.length !== 13) {
          newErrors['contact-number'] = "Invalid format. Should be +63XXXXXXXXXX (13 digits)";
        }
      } else if (phone.startsWith('09')) {
        if (phone.length !== 11) {
          newErrors['contact-number'] = "Invalid format. Should be 09XXXXXXXXX (11 digits)";
        }
      } else {
        newErrors['contact-number'] = "Must start with +63 or 09";
      }
    }
    
    if (!formData.barangay) newErrors['barangay'] = "Barangay is required";
    if (!formData.municipality) newErrors['municipality'] = "Municipality is required";
    if (!formData.province) newErrors['province'] = "Province is required";
    if (!formData.region) newErrors['region'] = "Region is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.put('/client/profile', formData);
      
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        
        // Update localStorage
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update context if available
        if (updateUser) {
          updateUser(updatedUser);
        }
        
        // Call parent callback to refresh
        if (onProfileUpdated) {
          onProfileUpdated(updatedUser);
        }
        
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (error.response?.data?.errors) {
        const backendErrors = {};
        const errorMessages = [];
        
        Object.keys(error.response.data.errors).forEach(key => {
          const formattedKey = key.replace(/_/g, '-');
          backendErrors[formattedKey] = error.response.data.errors[key][0];
          errorMessages.push(error.response.data.errors[key][0]);
        });
        
        setErrors(backendErrors);
        toast.error("Validation Error", {
          description: errorMessages[0]
        });
      } else if (error.response?.data?.message) {
        toast.error("Error", {
          description: error.response.data.message
        });
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle>Edit Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                {/* Client ID - Read Only */}
                <Field>
                  <FieldLabel htmlFor="client-id">Client ID</FieldLabel>
                  <Input
                    id="client-id"
                    type="text"
                    value={formData.client_id}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Client ID cannot be changed
                  </p>
                </Field>

                {/* Organization */}
                <Field>
                  <FieldLabel htmlFor="organization">Organization</FieldLabel>
                  <Input
                    id="organization"
                    type="text"
                    placeholder="ORGANIZATION NAME"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                  />
                  {errors['organization'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['organization']}</p>
                  )}
                </Field>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="JOHN"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors['first-name'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['first-name']}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="middle-name">Middle Name (Optional)</FieldLabel>
                    <Input
                      id="middle-name"
                      type="text"
                      placeholder="JANE"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="DOE"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors['last-name'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['last-name']}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="suffix">Suffix (Optional)</FieldLabel>
                    <Select
                      id="suffix"
                      value={formData.suffix}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          suffix: e.target.value === "none" ? "" : e.target.value
                        }));
                      }}
                    >
                      <option value="none">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select name suffix if applicable
                    </p>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors['email'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['email']}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="contact-number">Contact Number</FieldLabel>
                    <Input
                      id="contact-number"
                      type="tel"
                      placeholder="+63 or 09 format"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      maxLength={13}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: +63XXXXXXXXXX or 09XXXXXXXXX
                    </p>
                    {errors['contact-number'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['contact-number']}</p>
                    )}
                  </Field>
                </div>

                {/* Address Selector */}
                <AddressSelector
                  values={{
                    region: formData.region,
                    province: formData.province,
                    municipality: formData.municipality,
                    barangay: formData.barangay
                  }}
                  onChange={({region, province, municipality, barangay}) => {
                    setFormData(prev => ({
                      ...prev,
                      region,
                      province,
                      municipality,
                      barangay
                    }));
                    setErrors(prev => ({
                      ...prev,
                      region: undefined,
                      province: undefined,
                      municipality: undefined,
                      barangay: undefined
                    }));
                  }}
                  errors={{
                    region: errors['region'],
                    province: errors['province'],
                    municipality: errors['municipality'],
                    barangay: errors['barangay']
                  }}
                />

                {/* Purok/Street */}
                <Field>
                  <FieldLabel htmlFor="purok">Purok/Street (Optional)</FieldLabel>
                  <Input
                    id="purok"
                    type="text"
                    placeholder="PUROK 1 or STREET NAME"
                    value={formData.purok}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter purok or street address
                  </p>
                </Field>

                {/* Status Field - Read Only */}
                <Field>
                  <FieldLabel htmlFor="status">Account Status</FieldLabel>
                  <Input
                    id="status"
                    type="text"
                    value={formData.status}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Account status cannot be changed
                  </p>
                </Field>
              </FieldGroup>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
