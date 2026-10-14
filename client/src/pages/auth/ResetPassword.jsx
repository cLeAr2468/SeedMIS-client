import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, KeyRound, Loader2, Lock, CheckCircle2 } from 'lucide-react';
import authService from '@/services/authService';
import { toast } from 'sonner';
import bgLogs from '@/assets/bg-logs.png';
import logo from '@/assets/logo.png';

const ResetPassword = ({ email, otp, onBackToLogin }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 'none', text: '' };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);
    const length = password.length;

    const checks = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (length < 8) {
      return { level: 'weak', text: 'Too short' };
    }
    if (checks < 3) {
      return { level: 'weak', text: 'Weak' };
    }
    if (checks === 3) {
      return { level: 'medium', text: 'Medium' };
    }
    return { level: 'strong', text: 'Strong' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.password || !formData.password_confirmation) {
      toast.error('Please fill in all fields');
      return;
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;
    
    if (formData.password.length < 8) {
      toast.error('Weak Password', {
        description: 'Password must be at least 8 characters long.'
      });
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      toast.error('Password Complexity Required', {
        description: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#).'
      });
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword({
        email,
        otp,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      
      if (response.success) {
        toast.success('Password Reset Successful!', {
          description: 'You can now login with your new password'
        });
        
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          } else {
            navigate('/login');
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Invalid or Expired OTP', {
          description: 'Please request a new OTP'
        });
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        toast.error('Validation Error', {
          description: firstError
        });
      } else {
        toast.error('Reset Failed', {
          description: 'Please try again later'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgLogs})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md shadow-2xl relative z-10 border-none bg-white/95 backdrop-blur-md">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl p-2 ring-4 ring-green-600/20">
              <img
                src={logo}
                alt="SeedMIS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                SeedMIS Client Portal
              </h1>
              <CardTitle className="text-xl font-bold text-gray-800">
                Reset Password
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Create a new strong password
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="8"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-green-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  minLength="8"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-green-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="p-4 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Password Strength:</span>
                  <span className={`text-sm font-semibold ${
                    strength.level === 'strong' ? 'text-green-600' :
                    strength.level === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {strength.text}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      strength.level === 'strong' ? 'w-full bg-green-600' :
                      strength.level === 'medium' ? 'w-2/3 bg-yellow-600' :
                      'w-1/3 bg-red-600'
                    }`}
                  />
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      ✓ At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={/[@$!%*?&#]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One special character (@$!%*?&#)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </Button>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-xs text-green-700">
                After resetting, you'll be redirected to login
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-white/70 mt-8 drop-shadow absolute bottom-4 left-1/2 -translate-x-1/2">
        © 2026 SeedMIS. All rights reserved.
      </p>
    </div>
  );
};

export default ResetPassword;
