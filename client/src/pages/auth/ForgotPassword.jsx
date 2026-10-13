import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Sprout, Mail } from 'lucide-react';
import authService from '@/services/authService';
import { toast } from 'sonner';
import bgLogs from '@/assets/bg-logs.png';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSent(true);
        toast.success('Password reset link sent!', {
          description: 'Please check your email for instructions.',
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                {sent ? 'Check Your Email' : 'Forgot Password?'}
              </CardTitle>
              <CardDescription className="mt-2">
                {sent
                  ? 'We have sent a password reset link to your email address.'
                  : 'Enter your email address and we will send you a link to reset your password.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    try again
                  </button>
                </p>
                <Link to="/login">
                  <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                {/* Back to Login */}
                <Link to="/login" className="block text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </form>
            )}
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
