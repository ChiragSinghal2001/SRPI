import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, KeyRound, Building, Phone, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useRedux';
import { setCredentials } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';
import { authService } from '../../services/authService';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['LANDLORD', 'TENANT']),
  company: z.string().optional(),
  phone: z.string().min(7, 'Please enter a valid phone number'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'LANDLORD',
      name: '',
      email: '',
      password: '',
      phone: '',
      company: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: SignupFormValues) => {
    setErrorMessage(null);
    try {
      const { user, token } = await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone,
        company: values.company,
      });

      dispatch(setCredentials({ user, token }));
      dispatch(
        addToast({
          type: 'success',
          title: 'Account Created Successfully',
          message: `Welcome to SmartInspector, ${user.name}!`,
        })
      );

      if (values.role === 'LANDLORD') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/tenant', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create account. Please try again.';
      setErrorMessage(msg);
      dispatch(
        addToast({
          type: 'error',
          title: 'Registration Failed',
          message: msg,
        })
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Create an Account</h2>
      <p className="text-xs text-slate-400 mb-5">
        Choose your role to get started with SmartInspector.
      </p>

      {/* Role Picker */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          I am registering as:
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setValue('role', 'LANDLORD')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'LANDLORD'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Landlord / Manager
          </button>
          <button
            type="button"
            onClick={() => setValue('role', 'TENANT')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'TENANT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tenant / Renter
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register('name')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              placeholder="e.g. Alex Johnson"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register('email')}
              type="email"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              placeholder="alex@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register('password')}
              type="password"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              placeholder="At least 6 characters"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register('phone')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        {selectedRole === 'LANDLORD' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Company / Management Name (Optional)
            </label>
            <div className="relative">
              <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('company')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                placeholder="Pacific Realty Corp"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 active:scale-98"
        >
          {isSubmitting ? (
            <span>Creating account...</span>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Register as {selectedRole}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-700 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-emerald-400 hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
