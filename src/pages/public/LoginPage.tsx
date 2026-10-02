import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  KeyRound,
  User as UserIcon,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
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
  const [otpStep, setOtpStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
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
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('कृपया वैध Email Address टाका');
      return;
    }

    try {
      setIsSendingOtp(true);
      await authApi.sendOtp({ email: cleanEmail, name: name.trim() });
      toast.success(`६-अंकी OTP तुमच्या ईमेलवर पाठवला आहे! 📩`);
      setOtpStep('verify');
      setCountdown(60);
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'OTP पाठवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.';
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error('कृपया ६-अंकी OTP कोड टाका');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const user = await loginWithOtp(email.trim().toLowerCase(), cleanOtp, name.trim());
      toast.success(`स्वागत आहे, ${user.name}! 🎉`);
      
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
      const msg = error?.response?.data?.error || 'चुकीचा OTP! कृपया कोड तपासा.';
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Admin Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordEmail || !password) {
      toast.error('Email आणि Password आवश्यक आहेत');
      return;
    }

    try {
      setIsLoggingInPassword(true);
      const user = await login(passwordEmail.trim(), password);
      toast.success(`स्वागत आहे, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'चुकीचा Email किंवा Password';
      toast.error(msg);
    } finally {
      setIsLoggingInPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md text-center flex flex-col items-center justify-center my-auto">
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-orange-950/20 hover:scale-105 transition-transform duration-300">
            <Logo size="lg" variant="light" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md mb-4">
            Safe, Comfortable & Reliable Journeys
          </h2>

          <p className="text-base text-orange-100/90 font-medium leading-relaxed max-w-sm mx-auto drop-shadow-sm">
            Experience premium vehicle bookings and comfortable outstation & airport transfers with Om Sai Travels.
          </p>

          <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-xs text-orange-100 font-medium">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Secure Passwordless OTP Verification</span>
          </div>
        </div>
      </div>

      {/* Right side — Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg py-8 px-6 sm:px-10 bg-white rounded-3xl shadow-2xl shadow-orange-950/5 border border-gray-100">
          
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-block mb-2">
              <Logo size="md" variant="dark" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              {authMode === 'otp' ? 'Instant Email Login' : 'Admin Security Access'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {authMode === 'otp' 
                ? (otpStep === 'email' ? 'Sign in with Email OTP' : 'Verify Your 6-Digit OTP')
                : 'Administrator Login'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {authMode === 'otp'
                ? (otpStep === 'email' 
                    ? 'ईमेल टाका, आम्ही तुमच्या इनबॉक्समध्ये ६-अंकी OTP पाठवू.' 
                    : `आम्ही ${email} वर OTP पाठवला आहे. कोड खाली टाका.`)
                : 'Enter your administrator credentials to access the management portal.'}
            </p>
          </div>

          {/* MODE 1: OTP AUTHENTICATION */}
          {authMode === 'otp' && (
            <>
              {otpStep === 'email' ? (
                /* Step 1: Request OTP Form */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                        <UserIcon size={18} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="उदा. Rohit Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-orange-600">*</span>
                    </label>
                    <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full mt-2 flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/25 text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-200 disabled:opacity-50 group cursor-pointer"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Get 6-Digit OTP</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP Form */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between text-xs text-orange-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-orange-600 shrink-0" />
                      <span className="font-semibold truncate max-w-[200px] sm:max-w-[260px]">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpStep('email')}
                      className="text-orange-700 hover:text-orange-900 font-bold underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Enter 6-Digit Code <span className="text-orange-600">*</span>
                    </label>
                    <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                        <KeyRound size={18} />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full pl-10 pr-4 py-3 bg-transparent text-xl font-mono tracking-[0.5em] text-gray-900 placeholder:text-gray-300 focus:outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span>Didn't receive email?</span>
                    {countdown > 0 ? (
                      <span className="text-orange-600 font-semibold">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otp.length < 6}
                    className="w-full mt-2 flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/25 text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-200 disabled:opacity-50 group cursor-pointer"
                  >
                    {isVerifyingOtp ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* MODE 2: ADMIN PASSWORD LOGIN */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Admin Email <span className="text-orange-600">*</span>
                </label>
                <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={passwordEmail}
                    onChange={(e) => setPasswordEmail(e.target.value)}
                    placeholder="admin@omsaikrupa.com"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-orange-600">*</span>
                </label>
                <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingInPassword}
                className="w-full mt-2 flex justify-center items-center py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/25 text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-200 disabled:opacity-50 group cursor-pointer"
              >
                {isLoggingInPassword ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Admin Secure Sign In</span>
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between OTP and Password login */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            {authMode === 'otp' ? (
              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className="text-xs text-gray-500 hover:text-orange-600 font-semibold transition-colors cursor-pointer"
              >
                🔐 Administrator? Sign in with Password
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode('otp')}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors cursor-pointer"
              >
                ← Back to Instant Email OTP Login
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
