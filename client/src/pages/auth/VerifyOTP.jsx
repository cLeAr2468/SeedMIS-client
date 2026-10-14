import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import authService from '@/services/authService';
import { toast } from 'sonner';
import ResetPassword from './ResetPassword';
import bgLogs from '@/assets/bg-logs.png';
import logo from '@/assets/logo.png';

const VerifyOTP = ({ email, onBack, onBackToLogin }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [timer, setTimer] = useState(600);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    const nextEmpty = newOtp.findIndex(val => !val);
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (timer <= 0) {
      toast.error('OTP has expired', {
        description: 'Please request a new OTP'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.verifyOtp(email, otpCode);
      
      if (response.success) {
        toast.success('OTP Verified!', {
          description: 'Now you can reset your password'
        });
        setShowResetPassword(true);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Invalid OTP', {
          description: 'The code you entered is incorrect or expired'
        });
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        toast.error('Validation Error', {
          description: firstError
        });
      } else {
        toast.error('Verification Failed', {
          description: 'Please check your connection and try again'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setOtp(['', '', '', '', '', '']);
        setTimer(600);
        toast.success('New OTP Sent!', {
          description: 'Check your email for the new verification code'
        });
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  if (showResetPassword) {
    return <ResetPassword email={email} otp={otp.join('')} onBackToLogin={onBackToLogin} />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgLogs})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <Card className="w-full max-w-md shadow-2xl relative z-10 border-none bg-white/95 backdrop-blur-md">
        <CardHeader className="space-y-4 pb-8">
          <button
            onClick={onBack}
            className="flex items-center text-green-600 hover:text-green-700 transition-colors group w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
          
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
                Verify OTP
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Enter the 6-digit code sent to your email
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-600 focus:ring-opacity-20 transition-all outline-none bg-white"
                  />
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-sm text-gray-600">
                    Time remaining:
                  </p>
                  <span className={`font-bold text-lg ${timer < 60 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatTime(timer)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Sent to {email}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting || timer <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors"
                disabled={timer > 540}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend OTP
              </button>
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

export default VerifyOTP;
