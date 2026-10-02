import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  X, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Mail,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';

export const LoginModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoginModalOpen, closeLoginModal, login, loginWithGoogle } = useAuthStore();

  // Mode: 'google' | 'admin'
  const [authMode, setAuthMode] = useState<'google' | 'admin'>('google');
  const [showCustomAccount, setShowCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  // Admin Password Flow States
  const [passwordEmail, setPasswordEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingInPassword, setIsLoggingInPassword] = useState(false);

  if (!isLoginModalOpen) return null;

  // Handle Google Login
  const handleGoogleLogin = async (name?: string, email?: string) => {
    try {
      setIsLoggingInGoogle(true);
      const googleUser = await loginWithGoogle({
        name: name || customName || 'Rohit',
        email: email || customEmail || 'rohit032006@gmail.com',
      });
      toast.success(`Welcome back, ${googleUser.name}! 🎉`);
      closeLoginModal();

      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      if (googleUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (redirect) {
        navigate(redirect);
      } else if (location.pathname === '/login') {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('Google Sign In failed. Please try again.');
    } finally {
      setIsLoggingInGoogle(false);
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
      closeLoginModal();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={closeLoginModal} 
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-7 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="md" variant="dark" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {authMode === 'google' ? 'Sign In' : 'Administrator Login'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {authMode === 'google' 
              ? 'Instant 1-click access to book rides and track bookings' 
              : 'Sign in with your admin credentials'}
          </p>
        </div>

        {/* Google Login View */}
        {authMode === 'google' ? (
          <div className="space-y-4">
            {/* Main 'Continue with Google' Button */}
            <button
              type="button"
              onClick={() => handleGoogleLogin('Rohit', 'rohit032006@gmail.com')}
              disabled={isLoggingInGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base rounded-2xl border-2 border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isLoggingInGoogle ? (
                <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Quick 1-Click Profile Card */}
            <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  R
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    Rohit
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-[11px] text-gray-500">rohit032006@gmail.com</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGoogleLogin('Rohit', 'rohit032006@gmail.com')}
                disabled={isLoggingInGoogle}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                1-Click Login
              </button>
            </div>

            {/* Switch / Custom Google account option */}
            {!showCustomAccount ? (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomAccount(true)}
                  className="text-xs text-gray-500 hover:text-orange-600 font-medium underline transition-colors cursor-pointer"
                >
                  Sign in with another Google account
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail) {
                    toast.error('Please enter your Google email address');
                    return;
                  }
                  handleGoogleLogin(customName || undefined, customEmail);
                }} 
                className="space-y-3 pt-2 border-t border-gray-100 animate-in fade-in duration-200"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Google Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isLoggingInGoogle}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Continue with this Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomAccount(false)}
                    className="px-3 py-2.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Admin Switcher */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => setAuthMode('admin')}
                className="text-xs text-gray-500 hover:text-orange-600 font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={12} />
                Administrator Login (Password)
              </button>
            </div>
          </div>
        ) : (
          /* Admin Password Login */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={passwordEmail}
                  onChange={(e) => setPasswordEmail(e.target.value)}
                  placeholder="admin@omsaikrupa.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Default credentials: admin@omsaikrupa.com / admin123</p>
            </div>

            <button
              type="submit"
              disabled={isLoggingInPassword}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingInPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setAuthMode('google')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors cursor-pointer"
              >
                ← Back to Google Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
