import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  Loader2, 
  ArrowRight, 
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
  const [serverOtp, setServerOtp] = useState<string | null>(null);
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
      const res = await authApi.sendOtp({ email: cleanEmail, name: name.trim() });
      const receivedDebugOtp = res.data?.debugOtp;
      if (receivedDebugOtp) {
        setServerOtp(receivedDebugOtp);
        setOtp(receivedDebugOtp);
        toast.success(`OTP जनरेट झाला: ${receivedDebugOtp}`, { duration: 6000 });
      } else {
        toast.success(`६-अंकी OTP तुमच्या ईमेलवर पाठवला आहे! 📩`);
      }
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Centered Clean Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {/* Logo and Simple Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="md" variant="dark" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {authMode === 'otp' 
              ? (otpStep === 'email' ? 'लॉगिन / साइन इन' : 'OTP व्हेरिफाय करा') 
              : 'Admin Login'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {authMode === 'otp'
              ? (otpStep === 'email' 
                  ? 'तुमचा ईमेल टाका, आम्ही ६-अंकी OTP पाठवू' 
                  : `${email} वर OTP पाठवला आहे`)
              : 'ॲडमिन पासवर्डने लॉगिन करा'}
          </p>
        </div>

        {/* OTP Login Form */}
        {authMode === 'otp' && (
          <>
            {otpStep === 'email' ? (
              /* Step 1: Email Form */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    नाव (पर्यायी)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. Rohit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ईमेल आयडी <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>OTP पाठवत आहे...</span>
                    </>
                  ) : (
                    <>
                      <span>OTP मिळवा</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verify OTP Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between text-xs text-orange-950">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 size={14} className="text-orange-600 shrink-0" />
                    <span className="font-medium truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpStep('email')}
                    className="text-orange-700 hover:underline font-semibold ml-2 cursor-pointer"
                  >
                    बदला
                  </button>
                </div>

                {serverOtp && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-xs text-emerald-800 font-medium">तुमचा ६-अंकी OTP खालीलप्रमाणे आहे:</p>
                    <p className="text-xl font-bold font-mono tracking-widest text-emerald-700 mt-0.5">{serverOtp}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ६-अंकी OTP टाका <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full py-2.5 px-3 rounded-xl border border-gray-300 text-center font-mono text-2xl tracking-[0.4em] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ईमेल आला नाही?</span>
                  {countdown > 0 ? (
                    <span className="text-orange-600 font-medium">{countdown}s नंतर पुन्हा पाठवा</span>
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
                  disabled={isVerifyingOtp || otp.length < 6}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>तपासत आहे...</span>
                    </>
                  ) : (
                    <>
                      <span>लॉगिन करा</span>
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
              ← Back to Email OTP Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
