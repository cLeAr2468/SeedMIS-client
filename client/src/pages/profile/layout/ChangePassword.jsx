import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save, Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import api from '@/services/api';

const ChangePassword = ({ isOpen, onClose, user }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [formData, setFormData] = React.useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [passwordStrength, setPasswordStrength] = React.useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setErrors({});
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
      setPasswordStrength({
        hasLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }

    // Check password strength for new password
    if (id === 'new_password') {
      setPasswordStrength({
        hasLength: value.length >= 8,
        hasUpper: /[A-Z]/.test(value),
        hasLower: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecial: /[@$!%*?&#]/.test(value),
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else {
      if (formData.new_password.length < 8) {
        newErrors.new_password = "Password must be at least 8 characters long";
      } else if (!passwordStrength.hasUpper) {
        newErrors.new_password = "Password must contain at least one uppercase letter";
      } else if (!passwordStrength.hasLower) {
        newErrors.new_password = "Password must contain at least one lowercase letter";
      } else if (!passwordStrength.hasNumber) {
        newErrors.new_password = "Password must contain at least one number";
      } else if (!passwordStrength.hasSpecial) {
        newErrors.new_password = "Password must contain at least one special character (@$!%*?&#)";
      }
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Please confirm your new password";
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match";
    }

    if (formData.current_password && formData.new_password && formData.current_password === formData.new_password) {
      newErrors.new_password = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.put('/client/change-password', formData);
      
      if (response.data.success) {
        toast.success("Password changed successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.response?.data?.errors) {
        const backendErrors = {};
        const errorMessages = [];
        
        Object.keys(error.response.data.errors).forEach(key => {
          backendErrors[key] = error.response.data.errors[key][0];
          errorMessages.push(error.response.data.errors[key][0]);
        });
        
        setErrors(backendErrors);
        toast.error("Validation Error", {
          description: errorMessages[0]
        });
      } else if (error.response?.data?.message) {
        // Handle wrong current password error
        if (error.response.data.message.toLowerCase().includes('current password')) {
          setErrors({ current_password: error.response.data.message });
        }
        toast.error("Error", {
          description: error.response.data.message
        });
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle>Change Password</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                {/* Current Password */}
                <Field>
                  <FieldLabel htmlFor="current_password">Current Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Enter current password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      className={errors.current_password ? "border-red-500" : ""}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.current_password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.current_password}
                    </p>
                  )}
                </Field>

                {/* New Password */}
                <Field>
                  <FieldLabel htmlFor="new_password">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className={errors.new_password ? "border-red-500" : ""}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.new_password}
                    </p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.new_password && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-1">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                      <PasswordRequirement met={passwordStrength.hasLength} text="At least 8 characters" />
                      <PasswordRequirement met={passwordStrength.hasUpper} text="One uppercase letter (A-Z)" />
                      <PasswordRequirement met={passwordStrength.hasLower} text="One lowercase letter (a-z)" />
                      <PasswordRequirement met={passwordStrength.hasNumber} text="One number (0-9)" />
                      <PasswordRequirement met={passwordStrength.hasSpecial} text="One special character (@$!%*?&#)" />
                    </div>
                  )}
                </Field>

                {/* Confirm New Password */}
                <Field>
                  <FieldLabel htmlFor="new_password_confirmation">Confirm New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="new_password_confirmation"
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={formData.new_password_confirmation}
                      onChange={handleInputChange}
                      className={errors.new_password_confirmation ? "border-red-500" : ""}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.new_password_confirmation && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.new_password_confirmation}
                    </p>
                  )}
                  {!errors.new_password_confirmation && formData.new_password && formData.new_password_confirmation && formData.new_password === formData.new_password_confirmation && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Change Password
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

export default ChangePassword;
