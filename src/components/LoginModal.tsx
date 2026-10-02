import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  X, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Mail, 
  User as UserIcon,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';

interface SavedAccount {
  name: string;
  email: string;
}

export const LoginModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoginModalOpen, closeLoginModal, login, loginWithGoogle } = useAuthStore();

  // Mode: 'google' | 'admin'
  const [authMode, setAuthMode] = useState<'google' | 'admin'>('google');
  
  // Dynamic user input (no hardcoding!)
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Accounts saved by the user on this browser
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  // Admin Password Flow States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Load saved accounts from localStorage on modal open
  useEffect(() => {
    try {
      const stored = localStorage.getItem('osk_user_accounts');
      if (stored) {
        setSavedAccounts(JSON.parse(stored));
      }
    } catch (e) {}
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const saveAccountToHistory = (accountName: string, accountEmail: string) => {
    try {
      const existing: SavedAccount[] = JSON.parse(localStorage.getItem('osk_user_accounts') || '[]');
      const filtered = existing.filter(a => a.email.toLowerCase() !== accountEmail.toLowerCase());
      const updated = [{ name: accountName, email: accountEmail }, ...filtered].slice(0, 5);
      localStorage.setItem('osk_user_accounts', JSON.stringify(updated));
      setSavedAccounts(updated);
    } catch (e) {}
  };

  const removeAccountFromHistory = (accountEmail: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a.email.toLowerCase() !== accountEmail.toLowerCase());
    localStorage.setItem('osk_user_accounts', JSON.stringify(updated));
    setSavedAccounts(updated);
  };

  // Handle Google / Email Sign In for ANY entered email
  const handleSignIn = async (targetEmail?: string, targetName?: string) => {
    const finalEmail = (targetEmail || email).trim().toLowerCase();
    const finalName = (targetName || name).trim();

    if (!finalEmail) {
      toast.error('Please enter your Google email address');
      return;
    }

    if (!finalEmail.includes('@') || !finalEmail.includes('.')) {
      toast.error('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    try {
      setIsLoggingIn(true);
      const user = await loginWithGoogle({
        name: finalName || finalEmail.split('@')[0],
        email: finalEmail,
      });

      saveAccountToHistory(user.name, user.email);
      toast.success(`Welcome, ${user.name}! 🎉`);
      closeLoginModal();

      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (redirect) {
        navigate(redirect);
      } else if (location.pathname === '/login') {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Password Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error('Admin email and password are required');
      return;
    }

    try {
      setIsAdminLoggingIn(true);
      const user = await login(adminEmail.trim(), adminPassword);
      toast.success(`Welcome, ${user.name}!`);
      closeLoginModal();
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Invalid admin credentials';
      toast.error(msg);
    } finally {
      setIsAdminLoggingIn(false);
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
              ? 'Enter any email to sign in to your account' 
              : 'Sign in with your admin credentials'}
          </p>
        </div>

        {authMode === 'google' ? (
          <div className="space-y-4">
            {/* If user previously signed in with accounts on this browser, show their own accounts */}
            {savedAccounts.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-600">Your accounts on this device:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {savedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSignIn(acc.email, acc.name)}
                      className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-orange-50/70 border border-gray-200 hover:border-orange-200 rounded-xl cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-gray-900 group-hover:text-orange-600 truncate">{acc.name || acc.email}</div>
                          <div className="text-[11px] text-gray-500 truncate">{acc.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => removeAccountFromHistory(acc.email, e)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors"
                          title="Remove from device"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative py-2 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <span className="relative bg-white px-3 text-[11px] text-gray-400 font-medium uppercase">Or use another email</span>
                </div>
              </div>
            )}

            {/* Email & Name Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. yourname@gmail.com)"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Name (Optional)
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Continue with Google Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? (
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
            </form>

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
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
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
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Default credentials: admin@omsaikrupa.com / admin123</p>
            </div>

            <button
              type="submit"
              disabled={isAdminLoggingIn}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAdminLoggingIn ? (
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
