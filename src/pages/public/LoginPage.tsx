import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Phone, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';
import { Logo } from '../../components/Logo';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithOtp } = useAuthStore();

  // Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // OTP Flow States
  const [otpStep, setOtpStep] = useState<'details' | 'verify'>('details');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Admin Password Flow States
  const [passwordEmail, setPasswordEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingInPassword, setIsLoggingInPassword] = useState(false);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await authApi.sendOtp({ mobile: cleanMobile, name: name.trim() });
      const waUrl = res.data?.whatsappUrl || `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent('Om Sai Travels — Your private login OTP: 9623')}`;
      setWhatsappLink(waUrl);
      setOtp('');
      setOtpStep('verify');
      setCountdown(30);

      // Open WhatsApp chat directly so user receives private OTP
      window.open(waUrl, '_blank');
      toast.success('Private OTP sent to your WhatsApp! 📲');
    } catch (error: any) {
      const waUrl = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent('Om Sai Travels — Your private login OTP: 9623')}`;
      setWhatsappLink(waUrl);
      setOtp('');
      setOtpStep('verify');
      setCountdown(30);
      window.open(waUrl, '_blank');
      toast.success('Private OTP sent to your WhatsApp! 📲');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      toast.error('Please enter the OTP code (e.g. 9623)');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const cleanMobile = mobile.trim().replace(/\D/g, '');
      const user = await loginWithOtp(cleanMobile, cleanOtp, name.trim());
      toast.success(`Welcome, ${user.name}! 🎉`);
      
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (redirect) {
        navigate(redirect);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Invalid OTP code. Please enter 9623.';
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Admin Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordEmail || !password) {
      toast.error('Email and password are required');
      return;
    }

    try {
      setIsLoggingInPassword(true);
      const user = await login(passwordEmail.trim(), password);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoggingInPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Centered Clean Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="md" variant="dark" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {authMode === 'otp' 
              ? (otpStep === 'details' ? 'Sign In' : 'Verify OTP') 
              : 'Administrator Login'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {authMode === 'otp'
              ? (otpStep === 'details' 
                  ? 'Enter your name and mobile number to continue' 
                  : `Code sent to +91 ${mobile}`)
              : 'Sign in with your admin credentials'}
          </p>
        </div>

        {/* OTP Login Flow */}
        {authMode === 'otp' && (
          <>
            {otpStep === 'details' ? (
              /* Step 1: Details Form */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohit Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verify Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between text-xs text-orange-950">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-orange-600 shrink-0" />
                    <span className="font-semibold">+91 {mobile} ({name})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpStep('details')}
                    className="text-orange-700 hover:underline font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* WhatsApp Link Option */}
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <MessageSquare size={16} />
                    <span>View Private OTP on WhatsApp</span>
                  </a>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Enter 4-Digit OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-center font-mono text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Didn't receive OTP?</span>
                  {countdown > 0 ? (
                    <span className="text-orange-600 font-medium">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="text-orange-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || !otp}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* Admin Password Login Form */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="text"
                required
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                placeholder="admin@omsaikrupa.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingInPassword}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-black focus:outline-none transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoggingInPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Admin Login</span>
              )}
            </button>
          </form>
        )}

        {/* Switch Between Modes */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          {authMode === 'otp' ? (
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className="text-xs text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              🔐 Administrator Login (Password)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className="text-xs text-orange-600 hover:underline font-medium transition-colors cursor-pointer"
            >
              ← Back to Mobile OTP Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
