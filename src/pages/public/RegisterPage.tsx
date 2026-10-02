import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { 
  Car, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/Logo';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await registerUser({
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        password: data.password,
      });
      toast.success(`Account created! Welcome, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Registration failed. Try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
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
            Join thousands of happy travellers for safe, comfortable & premium journeys.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
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
              New Customer Registration
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Fill in your information to start booking your transfers.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-orange-600">*</span>
              </label>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="Rahul Sharma"
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.name.message}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-orange-600">*</span>
              </label>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none text-xs font-bold text-gray-500 border-r border-gray-200 pr-2.5 h-6 my-auto">
                  +91
                </div>
                <input
                  type="tel"
                  {...register('mobile')}
                  className="w-full pl-20 pr-4 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="98765 43210"
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.mobile.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-orange-600">*</span>
              </label>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="rahul.sharma@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-orange-600">*</span>
              </label>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full pl-11 pr-12 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Strength meter */}
              {password && (
                <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                    <span className="text-gray-500">Security Strength:</span>
                    <span className={
                      strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-emerald-600'
                    }>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                  <div className="flex gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          strength >= level ? strengthColors[strength] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-orange-600">*</span>
              </label>
              <div className="group relative rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 focus-within:bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-200 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="w-full pl-11 pr-12 py-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 font-medium">⚠️ {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-xs text-center text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-orange-500 hover:underline font-medium">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-orange-500 hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
