import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, KeyRound, Mail, UserCheck } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useRedux';
import { setCredentials } from '../../store/slices/authSlice';
import { UserRole } from '../../types/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['LANDLORD', 'TENANT']),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'john.lock@realtycorp.com',
      password: 'password123',
      role: 'LANDLORD',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: LoginFormValues) => {
    // Simulated auth delay
    await new Promise((res) => setTimeout(res, 500));

    if (values.role === 'LANDLORD') {
      dispatch(
        setCredentials({
          user: {
            id: 'usr_landlord_1',
            name: 'John Lock',
            email: values.email,
            role: 'LANDLORD',
            company: 'Pacific Heights Property Management',
            avatarUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          token: 'mock_jwt_token_landlord_xyz_123',
        })
      );
      const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      dispatch(
        setCredentials({
          user: {
            id: 'usr_tenant_1',
            name: 'Sarah Miller',
            email: values.email,
            role: 'TENANT',
            assignedPropertyId: 'prop_1',
            avatarUrl:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          },
          token: 'mock_jwt_token_tenant_abc_789',
        })
      );
      const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/tenant';
      navigate(destination, { replace: true });
    }
  };

  const handleQuickFill = (role: UserRole) => {
    if (role === 'LANDLORD') {
      setValue('email', 'john.lock@realtycorp.com');
      setValue('role', 'LANDLORD');
    } else {
      setValue('email', 'sarah.miller@example.com');
      setValue('role', 'TENANT');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Sign in to your account</h2>
      <p className="text-xs text-slate-400 mb-6">
        Select your role below or click a quick-demo profile to test instantly.
      </p>

      {/* Role Selection Segmented Control */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Select Role
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => handleQuickFill('LANDLORD')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'LANDLORD'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck size={14} /> Landlord
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('TENANT')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'TENANT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck size={14} /> Tenant
          </button>
        </div>
      </div>

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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
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
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Signing in...</span>
          ) : (
            <>
              <LogIn size={16} />
              <span>Sign in as {selectedRole}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-700 text-center text-xs text-slate-400">
        Don&apos;t have an account yet?{' '}
        <Link to="/signup" className="text-blue-400 hover:underline font-semibold">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
