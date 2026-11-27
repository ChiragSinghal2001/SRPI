import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  Mail,
  Lock,
  Save,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import { cn } from '../../utils/cn';

const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(6, 'New password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords don't match",
    path: ['confirm_password'],
  });

type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const AdminProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    // Simulated credential change
    await new Promise((r) => setTimeout(r, 400));
    dispatch(
      addToast({
        type: 'success',
        title: 'Credentials Updated',
        message: 'Administrator password was changed successfully.',
      })
    );
    reset();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Administrator Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Superuser account security and oversight credentials.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.name || 'System Administrator'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Superuser
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Mail size={13} />
              <span>{user?.email || 'admin@srpi.test'}</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <strong className="block font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
            Oversight Role Boundaries
          </strong>
          Admins hold elevated governance permissions across tenant accounts, tamper-evident ledgers, and inference retries. Admins cannot sign inspections as landlords or dispute as tenants.
        </div>
      </div>

      {/* Password Change Form */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <KeyRound size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Change Administrator Password
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Current Password *
            </label>
            <input
              type="password"
              {...register('current_password')}
              placeholder="Enter current password"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            {errors.current_password && (
              <p className="text-red-500 mt-1">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              New Password *
            </label>
            <input
              type="password"
              {...register('new_password')}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            {errors.new_password && (
              <p className="text-red-500 mt-1">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              {...register('confirm_password')}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            {errors.confirm_password && (
              <p className="text-red-500 mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs disabled:opacity-50 transition-colors shadow-xs"
            >
              <Save size={14} />
              <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
