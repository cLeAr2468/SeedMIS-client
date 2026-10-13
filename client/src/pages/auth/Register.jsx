import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Eye, EyeOff, Loader2, Sprout, ArrowLeft, Check, X } from 'lucide-react';
import { AddressSelector } from '@/components/AddressSelector';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import bgLogs from '@/assets/bg-logs.png';
import logo from '@/assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    organization: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    contact_number: '',
    barangay: '',
    municipality: '',
    province: '',
    region: '',
    purok: '',
    password: '',
    password_confirmation: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Name fields - only letters and spaces, uppercase
    if (['first_name', 'middle_name', 'last_name'].includes(name)) {
      processedValue = value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
    }
    // Purok - auto-uppercase
    else if (name === 'purok') {
      processedValue = value.toUpperCase();
    }
    // Contact number - Philippine format
    else if (name === 'contact_number') {
      let cleaned = value.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+63')) {
        cleaned = cleaned.substring(0, 13);
      } else if (cleaned.startsWith('09')) {
        cleaned = cleaned.substring(0, 11);
      } else if (cleaned.startsWith('9')) {
        cleaned = '0' + cleaned;
        cleaned = cleaned.substring(0, 11);
      } else if (cleaned.startsWith('63') && cleaned.length > 2) {
        cleaned = '+' + cleaned;
        cleaned = cleaned.substring(0, 13);
      } else {
        cleaned = cleaned.substring(0, 11);
      }
      processedValue = cleaned;
    }
    // Password and email - keep as is
    else if (['password', 'password_confirmation', 'email'].includes(name)) {
      processedValue = value;
    }
    // All other text fields - uppercase
    else {
      processedValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: processedValue });
    
    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleAddressChange = (addressValues) => {
    setFormData({
      ...formData,
      region: addressValues.region,
      province: addressValues.province,
      municipality: addressValues.municipality,
      barangay: addressValues.barangay,
    });
    
    // Clear address errors
    setErrors({
      ...errors,
      region: undefined,
      province: undefined,
      municipality: undefined,
      barangay: undefined,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization) newErrors.organization = 'Organization is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.middle_name) newErrors.middle_name = 'Middle name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    
    // Contact number validation
    if (!formData.contact_number) {
      newErrors.contact_number = 'Contact number is required';
    } else {
      const phone = formData.contact_number;
      if (phone.startsWith('+63')) {
        if (phone.length !== 13) {
          newErrors.contact_number = 'Invalid format. Should be +63XXXXXXXXXX (13 digits)';
        }
      } else if (phone.startsWith('09')) {
        if (phone.length !== 11) {
          newErrors.contact_number = 'Invalid format. Should be 09XXXXXXXXX (11 digits)';
        }
      } else {
        newErrors.contact_number = 'Must start with +63 or 09';
      }
    }

    if (!formData.barangay) newErrors.barangay = 'Barangay is required';
    if (!formData.municipality) newErrors.municipality = 'Municipality is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.region) newErrors.region = 'Region is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Confirm password is required';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return null;

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;
    
    return { checks, passed };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData);
      if (response.success) {
        toast.success('Registration successful!', {
          description: 'Please check your email for verification.',
        });
        navigate('/login');
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
        const firstError = Object.values(error.errors)[0];
        toast.error('Validation Error', {
          description: Array.isArray(firstError) ? firstError[0] : firstError,
        });
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen py-8 px-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgLogs})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Registration Form */}
        <Card className="shadow-2xl border-none bg-white/95 backdrop-blur-md">
          <CardHeader className="space-y-4 pb-6">
            {/* Logo and Branding inside card */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl p-2 ring-4 ring-green-600/20">
                <img
                  src={logo}
                  alt="SeedMIS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  SeedMIS
                </h1>
                <p className="text-green-700 font-medium mt-1">Client Portal</p>
                <p className="text-gray-600 text-sm mt-0.5">San Jorge Experiment Station</p>
              </div>
            </div>
            <div className="text-center pt-2">
              <CardTitle className="text-2xl font-bold text-gray-800">Create Account</CardTitle>
              <CardDescription className="mt-2">
                Please fill in all the required information to create your account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder="ORGANIZATION NAME"
                  value={formData.organization}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  className={errors.organization ? 'border-red-500' : ''}
                />
                {errors.organization && (
                  <p className="text-red-500 text-sm">{errors.organization}</p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="JUAN"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={errors.first_name ? 'border-red-500' : ''}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm">{errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name *</Label>
                  <Input
                    id="middle_name"
                    name="middle_name"
                    placeholder="DELA"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={errors.middle_name ? 'border-red-500' : ''}
                  />
                  {errors.middle_name && (
                    <p className="text-red-500 text-sm">{errors.middle_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="CRUZ"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm">{errors.last_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suffix">Suffix (Optional)</Label>
                  <select
                    id="suffix"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">None</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                    <option value="V">V</option>
                  </select>
                  {errors.suffix && (
                    <p className="text-red-500 text-sm">{errors.suffix}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan.delacruz@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number *</Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    placeholder="09XXXXXXXXX or +63XXXXXXXXXX"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    disabled={loading}
                    maxLength={13}
                    required
                    className={errors.contact_number ? 'border-red-500' : ''}
                  />
                  {errors.contact_number && (
                    <p className="text-red-500 text-sm">{errors.contact_number}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Address Information</h3>
                <AddressSelector
                  values={{
                    region: formData.region,
                    province: formData.province,
                    municipality: formData.municipality,
                    barangay: formData.barangay,
                  }}
                  onChange={handleAddressChange}
                  errors={{
                    region: errors.region,
                    province: errors.province,
                    municipality: errors.municipality,
                    barangay: errors.barangay,
                  }}
                  disabled={loading}
                />

                {/* Purok Field */}
                <div className="space-y-2">
                  <Label htmlFor="purok">Purok / Street / Subdivision (Optional)</Label>
                  <Input
                    id="purok"
                    name="purok"
                    placeholder="PUROK 1 / STREET NAME"
                    value={formData.purok}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={errors.purok ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter specific location within barangay
                  </p>
                  {errors.purok && (
                    <p className="text-red-500 text-sm">{errors.purok}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Account Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {passwordStrength && formData.password && (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-gray-700">Password strength:</p>
                      <div className="space-y-1">
                        {Object.entries({
                          length: 'At least 8 characters',
                          uppercase: 'One uppercase letter',
                          lowercase: 'One lowercase letter',
                          number: 'One number',
                          special: 'One special character',
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center gap-2">
                            {passwordStrength.checks[key] ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={passwordStrength.checks[key] ? 'text-green-600' : 'text-gray-500'}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      disabled={loading}
                      required
                      className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-red-500 text-sm">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-white/70 mt-8 drop-shadow">
          © 2026 SeedMIS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
