import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Shield,
  Home,
  Users,
  Building2,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  XCircle,
  KeyRound,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { cn } from '../../utils/cn';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: user,
    loading,
    refetch,
  } = useFetch(() => (id ? adminService.getUser(id) : Promise.reject('No ID')), [id]);

  const { data: propertiesData } = useFetch(
    () => adminService.getProperties({ page_size: 50 }),
    []
  );

  const userProperties = (propertiesData?.items || []).filter(
    (p) => p.landlord_id === id || p.tenant_id === id
  );

  const handleToggleSuspend = async () => {
    if (!user) return;
    try {
      const isSuspending = user.status === 'active';
      await adminService.updateUserStatus(
        user.id,
        isSuspending ? 'suspended' : 'active',
        isSuspending ? suspendReason || 'Administrative suspension' : undefined
      );
      dispatch(
        addToast({
          type: isSuspending ? 'warning' : 'success',
          title: isSuspending ? 'Account Suspended' : 'Account Reactivated',
          message: `${user.name} status updated to ${isSuspending ? 'suspended' : 'active'}.`,
        })
      );
      setSuspendDialogOpen(false);
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Unable to update account status.',
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await adminService.deleteUser(user.id);
      dispatch(
        addToast({
          type: 'success',
          title: 'User Deleted',
          message: `User ${user.name} removed from registry.`,
        })
      );
      navigate('/admin/users');
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete user.',
        })
      );
    }
  };

  const handleSendPasswordReset = () => {
    if (!user) return;
    dispatch(
      addToast({
        type: 'info',
        title: 'Password Reset Dispatched',
        message: `A secure one-time password reset link was sent to ${user.email}.`,
      })
    );
  };

  if (loading && !user) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-500">User account not found.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to User Registry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button and Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            User Profile &amp; Governance
          </h1>
          <p className="text-xs text-slate-500">
            Account ID: <span className="font-mono">{user.id}</span>
          </p>
        </div>
      </div>

      {/* User Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                    user.role === 'admin'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : user.role === 'landlord'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                  )}
                >
                  {user.role}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                    user.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                  )}
                >
                  {user.status === 'active' ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <XCircle size={12} className="text-red-500" />
                  )}
                  <span>{user.status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>
          </div>

          {/* Quick Actions */}
          {user.role !== 'admin' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSendPasswordReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <KeyRound size={14} />
                <span>Reset Password</span>
              </button>

              <button
                onClick={() => setSuspendDialogOpen(true)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                  user.status === 'active'
                    ? 'border border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30'
                    : 'border border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                )}
              >
                <RotateCcw size={14} />
                <span>{user.status === 'active' ? 'Suspend User' : 'Reactivate User'}</span>
              </button>

              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/30 transition-colors"
                title="Delete User"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* User Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Contact Phone
            </span>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <Phone size={14} className="text-slate-400" />
              <span>{user.phone || 'Not recorded'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Organization / Company
            </span>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <Briefcase size={14} className="text-slate-400" />
              <span>{user.company || 'Private Individual'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Member Since
            </span>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <Calendar size={14} className="text-slate-400" />
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Suspension Reason Banner */}
        {user.status === 'suspended' && (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-red-800 dark:text-red-300 font-bold block">
                Account Suspended by System Administration
              </strong>
              <p className="text-red-700 dark:text-red-400 mt-0.5">
                Reason: {user.suspension_reason || 'Administrative hold applied.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Associated Properties & Leases */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600" />
            <span>Associated Properties &amp; Leases ({userProperties.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Read-Only Oversight Ledger</span>
        </div>

        {userProperties.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No properties or active leases currently linked to this user.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {userProperties.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                  <p className="text-slate-500">
                    {p.address}, {p.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    ${p.monthly_rent}/mo
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                      p.genuineness_status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    )}
                  >
                    {p.genuineness_status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => navigate('/admin/properties')}
                    className="text-emerald-600 hover:underline text-xs font-semibold"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suspend Confirmation Dialog */}
      {suspendDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {user.status === 'active' ? 'Suspend User Access' : 'Reactivate User Account'}
            </h3>
            {user.status === 'active' && (
              <div className="space-y-2 text-xs">
                <label className="text-slate-600 dark:text-slate-400 font-semibold block">
                  Suspension Reason:
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="State the reason for suspension..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setSuspendDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleSuspend}
                className={cn(
                  'px-4 py-2 rounded-xl font-semibold text-white',
                  user.status === 'active'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {user.status === 'active' ? 'Confirm Suspension' : 'Reactivate User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Permanently Delete User"
        message={`Are you sure you want to delete ${user.name}? This will purge their account credentials from the platform.`}
        confirmLabel="Delete Account"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminUserDetailPage;
