import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/Logo';

const loginSchema = z.object({
  emailOrMobile: z.string().min(1, 'Email किंवा Mobile number टाका'),
  password: z.string().min(6, 'Password कमीत कमी 6 characters असावा'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data.emailOrMobile, data.password);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Login failed. Credentials चेक करा.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Subtle decorative grid/glow particles */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-800/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md text-center flex flex-col items-center justify-center my-auto">
          {/* Centered Logo badge with glassmorphism */}
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-orange-950/20 hover:scale-105 transition-transform duration-300">
            <Logo size="lg" variant="light" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md mb-4">
            Safe, Comfortable & Reliable Journeys
          </h2>

          <p className="text-base text-orange-100/90 font-medium leading-relaxed max-w-sm mx-auto drop-shadow-sm">
            Safe, comfortable and reliable vehicle booking for airport transfers and city travel.
          </p>
        </div>
      </div>

      {/* Right side — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg py-8 px-6 sm:px-10 bg-white rounded-3xl shadow-2xl shadow-orange-950/5 border border-gray-100">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-block mb-2">
              <Logo size="md" variant="dark" />
            </div>
          </div>

          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Member Login
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to manage bookings & trips.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email / Mobile */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email or Mobile Number <span className="text-orange-600">*</span>
              </label>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  {...register('emailOrMobile')}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="Email address or 10-digit mobile"
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {errors.emailOrMobile && (
                <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.emailOrMobile.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password <span className="text-orange-600">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-11 pr-12 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.password.message}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">New to Om Sai Krupa?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-orange-300 focus:outline-none transition-all"
          >
            Create New Account
          </Link>

          {/* Footer */}
          <p className="mt-8 text-xs text-center text-gray-400">
            © 2026 Om Sai Krupa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
