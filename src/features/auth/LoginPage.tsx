import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, KeyRound, Mail, UserCheck, AlertCircle, Sparkles, Building2, User, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useRedux';
import { setCredentials } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { UserRole } from '../../types/auth';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['LANDLORD', 'TENANT', 'ADMIN', 'admin', 'landlord', 'tenant']).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableAccounts = authService.getUsers();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'Unnati.lock@realtycorp.com',
      password: 'password123',
      role: 'LANDLORD',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const isTypedAdmin = values.email.trim().toLowerCase() === 'admin@srpi.test';
      const roleToSubmit = isTypedAdmin ? 'ADMIN' : values.role;

      const { user, token } = await authService.login({
        email: values.email,
        password: values.password,
        role: roleToSubmit,
      });

      dispatch(setCredentials({ user, token }));
      dispatch(
        addToast({
          type: 'success',
          title: 'Signed In Successfully',
          message: `Welcome back, ${user.name}!`,
        })
      );

      const normalizedRole = user.role.toLowerCase();
      const defaultDest =
        normalizedRole === 'admin'
          ? '/admin/dashboard'
          : normalizedRole === 'tenant'
          ? '/tenant'
          : '/dashboard';

      const destination =
        (location.state as { from?: { pathname: string } })?.from?.pathname || defaultDest;
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMessage(msg);
      dispatch(
        addToast({
          type: 'error',
          title: 'Sign In Failed',
          message: msg,
        })
      );
    }
  };

  const handleQuickFill = (email: string, role: UserRole) => {
    setValue('email', email);
    setValue('password', 'password123');
    setValue('role', role);
    setErrorMessage(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Sign in to your account</h2>
      <p className="text-xs text-slate-400 mb-6">
        Select your role below or choose a profile to test immediately.
      </p>

      {/* Role Selection Segmented Control */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Select Role
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => handleQuickFill('Unnati.lock@realtycorp.com', 'LANDLORD')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole?.toUpperCase() === 'LANDLORD'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 size={13} /> Landlord
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('Anushka.miller@example.com', 'TENANT')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole?.toUpperCase() === 'TENANT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={13} /> Tenant
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin@srpi.test', 'ADMIN')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole?.toUpperCase() === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck size={13} /> Admin
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              {...register('email')}
              type="email"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
              placeholder="name@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <KeyRound
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              {...register('password')}
              type="password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 rounded-lg text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 active:scale-98 bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <span>Signing in...</span>
          ) : (
            <>
              <LogIn size={16} />
              <span>
                Sign in as{' '}
                {selectedRole?.toUpperCase() === 'ADMIN'
                  ? 'Admin'
                  : selectedRole?.toUpperCase() === 'TENANT'
                  ? 'Tenant'
                  : 'Landlord'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Available Profiles for 1-Click Presentation Switching */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          <Sparkles size={13} className="text-emerald-400" />
          <span>Demo &amp; Registered Profiles</span>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {availableAccounts.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => handleQuickFill(acc.email, acc.role)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all text-xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {acc.role.toLowerCase() === 'admin' ? (
                    <ShieldCheck size={12} className="text-emerald-400" />
                  ) : acc.role.toUpperCase() === 'LANDLORD' ? (
                    <Building2 size={12} />
                  ) : (
                    <User size={12} />
                  )}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-200 group-hover:text-emerald-300 block truncate">
                    {acc.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {acc.email}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase shrink-0 bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                {acc.role}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Don&apos;t have an account yet?{' '}
        <Link to="/signup" className="text-emerald-400 hover:underline font-semibold">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
