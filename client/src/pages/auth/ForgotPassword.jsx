import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail, Send } from 'lucide-react';
import authService from '@/services/authService';
import { toast } from 'sonner';
import VerifyOTP from './VerifyOTP';
import bgLogs from '@/assets/bg-logs.png';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success('OTP Sent!', {
          description: 'Check your email for the verification code'
        });
        setShowVerifyOTP(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        toast.error('Email Not Found', {
          description: 'This email is not registered in the system'
        });
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        toast.error('Validation Error', {
          description: firstError
        });
      } else {
        toast.error('Request Failed', {
          description: 'Please check your connection and try again'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showVerifyOTP) {
    return <VerifyOTP email={email} onBack={() => setShowVerifyOTP(false)} />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgLogs})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Forgot Password Card */}
        <Card className="shadow-2xl border-none bg-white/95 backdrop-blur-md">
          <CardHeader className="space-y-4 pb-6">
            <Link
              to="/login"
              className="flex items-center text-green-600 hover:text-green-700 transition-colors group w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Login</span>
            </Link>

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
              <CardTitle className="text-2xl font-bold text-gray-800">
                Forgot Password?
              </CardTitle>
              <CardDescription className="mt-2">
                We'll send you a verification code
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-11"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800 font-medium">
                  OTP will be sent to your registered email
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {email ? `Email: ${email}` : 'Enter your email address above'}
                </p>
              </div>
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

export default ForgotPassword;
