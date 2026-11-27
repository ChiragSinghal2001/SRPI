import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Home,
  CheckCircle2,
  XCircle,
  MoreVertical,
  KeyRound,
  Trash2,
  RotateCcw,
  Eye,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { AdminUser, AdminUserCreateInput, AdminUserCreateSchema } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import DataTable, { Column } from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { cn } from '../../utils/cn';

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Search, filter, pagination state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'landlord' | 'tenant'>('tenant');

  // Fetch users with params
  const {
    data: paginatedUsers,
    loading,
    refetch,
  } = useFetch(
    () =>
      adminService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        page_size: pageSize,
      }),
    [search, roleFilter, statusFilter, page]
  );

  // Form for Adding User
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserCreateInput>({
    resolver: zodResolver(AdminUserCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'tenant',
      temporary_password: '',
      phone: '',
      company: '',
    },
  });

  const onAddUserSubmit = async (data: AdminUserCreateInput) => {
    try {
      await adminService.createUser(data);
      dispatch(
        addToast({
          type: 'success',
          title: 'User Created',
          message: `Created account for ${data.name} (${data.role}). Temporary credentials active.`,
        })
      );
      reset();
      setAddUserModalOpen(false);
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Creation Failed',
          message: 'Could not create user account.',
        })
      );
    }
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUser) return;
    try {
      const isSuspending = selectedUser.status === 'active';
      await adminService.updateUserStatus(
        selectedUser.id,
        isSuspending ? 'suspended' : 'active',
        isSuspending ? suspendReason || 'Administrative suspension' : undefined
      );
      dispatch(
        addToast({
          type: isSuspending ? 'warning' : 'success',
          title: isSuspending ? 'Account Suspended' : 'Account Reactivated',
          message: `${selectedUser.name} has been ${isSuspending ? 'suspended' : 'reactivated'}.`,
        })
      );
      setSuspendDialogOpen(false);
      setSelectedUser(null);
      setSuspendReason('');
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Action Failed',
          message: 'Unable to update user status.',
        })
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      dispatch(
        addToast({
          type: 'success',
          title: 'User Deleted',
          message: `User ${selectedUser.name} was removed from the system.`,
        })
      );
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: 'Unable to remove user at this time.',
        })
      );
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUserRole(selectedUser.id, newRole);
      dispatch(
        addToast({
          type: 'success',
          title: 'Role Updated',
          message: `${selectedUser.name} is now designated as ${newRole}.`,
        })
      );
      setChangeRoleDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Role Update Failed',
          message: 'Unable to update user role.',
        })
      );
    }
  };

  const handleSendPasswordReset = (user: AdminUser) => {
    dispatch(
      addToast({
        type: 'info',
        title: 'Password Reset Dispatched',
        message: `A secure one-time password reset link was sent to ${user.email}.`,
      })
    );
  };

  const totalPages = Math.ceil((paginatedUsers?.total || 0) / pageSize);

  const columns: Column<AdminUser>[] = [
    {
      header: 'User',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {u.name[0]}
          </div>
          <div className="min-w-0">
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${u.id}`);
              }}
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {u.name}
            </span>
            <span className="text-xs text-slate-500 truncate block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (u) => {
        const isLandlord = u.role === 'landlord';
        const isAdmin = u.role === 'admin';
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
              isAdmin
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : isLandlord
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            )}
          >
            {isAdmin ? <Shield size={11} /> : isLandlord ? <Home size={11} /> : <Users size={11} />}
            <span>{u.role}</span>
          </span>
        );
      },
    },
    {
      header: 'Status',
      cell: (u) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
            u.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
          )}
        >
          {u.status === 'active' ? (
            <CheckCircle2 size={12} className="text-emerald-500" />
          ) : (
            <XCircle size={12} className="text-red-500" />
          )}
          <span>{u.status}</span>
        </span>
      ),
    },
    {
      header: 'Units',
      cell: (u) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {u.properties_count || 0} {u.role === 'landlord' ? 'properties' : 'leases'}
        </span>
      ),
    },
    {
      header: 'Last Login',
      cell: (u) => (
        <span className="text-xs text-slate-500">
          {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      header: 'Joined',
      cell: (u) => (
        <span className="text-xs text-slate-500">
          {new Date(u.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/users/${u.id}`)}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Eye size={15} />
          </button>

          {u.role !== 'admin' && (
            <>
              {/* Suspend / Reactivate */}
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setSuspendReason(u.suspension_reason || '');
                  setSuspendDialogOpen(true);
                }}
                title={u.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  u.status === 'active'
                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                )}
              >
                <RotateCcw size={15} />
              </button>

              {/* Change Role */}
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setNewRole(u.role === 'landlord' ? 'tenant' : 'landlord');
                  setChangeRoleDialogOpen(true);
                }}
                title="Change Role (Landlord/Tenant)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                <Shield size={15} />
              </button>

              {/* Password Reset */}
              <button
                onClick={() => handleSendPasswordReset(u)}
                title="Dispatch Password Reset"
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <KeyRound size={15} />
              </button>

              {/* Delete */}
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setDeleteDialogOpen(true);
                }}
                title="Delete User"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title and Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Inspect accounts, manage landlord/tenant designations, enforce suspensions, and monitor tenant activity.
          </p>
        </div>

        <button
          onClick={() => setAddUserModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors shrink-0"
        >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="landlord">Landlords</option>
            <option value="tenant">Tenants</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={paginatedUsers?.items || []}
        keyExtractor={(u) => u.id}
        onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
        emptyMessage={loading ? 'Loading user registry...' : 'No users match your filter criteria.'}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, paginatedUsers?.total || 0)} of {paginatedUsers?.total} users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD USER (React Hook Form + Zod) */}
      {/* ======================================================== */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New User</h3>
              </div>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddUserSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g. Jessica Sterling"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="jessica@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Role Assignment *
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>
                {errors.role && <p className="text-red-500 mt-1">{errors.role.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Temporary Password *
                </label>
                <input
                  {...register('temporary_password')}
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                {errors.temporary_password && (
                  <p className="text-red-500 mt-1">{errors.temporary_password.message}</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone (Optional)
                </label>
                <input
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Company / Organization (Optional)
                </label>
                <input
                  {...register('company')}
                  placeholder="e.g. Apex Property Trust"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG: SUSPEND / REACTIVATE */}
      {/* ======================================================== */}
      {suspendDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  selectedUser.status === 'active'
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                )}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedUser.status === 'active' ? 'Suspend User Access' : 'Reactivate User Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
            </div>

            {selectedUser.status === 'active' ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Suspending this user will prevent them from logging in, viewing reports, or initiating new inspections. Please provide an administrative reason:
                </p>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Terms violation, disputed ownership, fraudulent report claim..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to reactivate this user? They will regain full portal access to their properties and reports.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSuspendDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold text-white',
                  selectedUser.status === 'active'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG: CHANGE ROLE */}
      {/* ======================================================== */}
      {changeRoleDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Change Role for {selectedUser.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current role: <strong className="text-slate-700 dark:text-slate-300">{selectedUser.role}</strong>. Select target designation (admin role cannot be assigned through user management):
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewRole('landlord')}
                className={cn(
                  'p-3 rounded-xl border text-xs font-bold text-center transition-all',
                  newRole === 'landlord'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => setNewRole('tenant')}
                className={cn(
                  'p-3 rounded-xl border text-xs font-bold text-center transition-all',
                  newRole === 'tenant'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                Tenant
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setChangeRoleDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Apply Role Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG: CONFIRM DELETE */}
      {/* ======================================================== */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action is irreversible and recorded in the audit log.`}
        confirmLabel="Delete User"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminUsersPage;
