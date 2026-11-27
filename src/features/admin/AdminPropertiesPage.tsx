import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  FileCheck2,
  DollarSign,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { PropertyAdmin } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import DataTable, { Column } from '../../components/common/DataTable';
import { cn } from '../../utils/cn';

export const AdminPropertiesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [genuinenessFilter, setGenuinenessFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Selected property for detail drawer
  const [selectedProperty, setSelectedProperty] = useState<PropertyAdmin | null>(null);

  const {
    data: paginatedProperties,
    loading,
    refetch,
  } = useFetch(
    () =>
      adminService.getProperties({
        search,
        genuineness: genuinenessFilter,
        page,
        page_size: pageSize,
      }),
    [search, genuinenessFilter, page]
  );

  const handleVerifyGenuineness = async (property: PropertyAdmin, status: 'verified' | 'flagged_discrepancy') => {
    try {
      const updated = await adminService.verifyPropertyGenuineness(property.id, status);
      dispatch(
        addToast({
          type: status === 'verified' ? 'success' : 'warning',
          title: status === 'verified' ? 'Property Deed Verified' : 'Discrepancy Flagged',
          message: `${property.name} genuineness status updated to ${status}.`,
        })
      );
      if (selectedProperty?.id === property.id) {
        setSelectedProperty(updated);
      }
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: 'Unable to verify property deed at this time.',
        })
      );
    }
  };

  const totalPages = Math.ceil((paginatedProperties?.total || 0) / pageSize);

  const columns: Column<PropertyAdmin>[] = [
    {
      header: 'Property Details',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <span
              onClick={() => setSelectedProperty(p)}
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {p.name}
            </span>
            <span className="text-xs text-slate-500 truncate block">
              {p.address}, {p.city}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Landlord',
      cell: (p) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
            {p.landlord_name}
          </span>
          <span className="text-[10px] text-slate-500">{p.landlord_email}</span>
        </div>
      ),
    },
    {
      header: 'Tenant',
      cell: (p) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
            {p.tenant_name || 'Vacant / Unleased'}
          </span>
          {p.tenant_email && <span className="text-[10px] text-slate-500">{p.tenant_email}</span>}
        </div>
      ),
    },
    {
      header: 'Inspections',
      cell: (p) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {p.inspections_count} cycles
        </span>
      ),
    },
    {
      header: 'Last Inspection',
      cell: (p) => (
        <span className="text-xs text-slate-500">
          {p.last_inspection_date
            ? new Date(p.last_inspection_date).toLocaleDateString()
            : 'No records'}
        </span>
      ),
    },
    {
      header: 'Genuineness Status',
      cell: (p) => {
        const isVerified = p.genuineness_status === 'verified';
        const isFlagged = p.genuineness_status === 'flagged_discrepancy';
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none',
              isVerified
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : isFlagged
                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            )}
          >
            {isVerified ? (
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
            ) : isFlagged ? (
              <ShieldAlert size={12} className="text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400" />
            )}
            <span>
              {isVerified
                ? 'Deed Verified'
                : isFlagged
                ? 'Discrepancy'
                : 'Pending Verification'}
            </span>
          </span>
        );
      },
    },
    {
      header: 'Admin Actions',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedProperty(p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Inspect Property Details"
          >
            <Eye size={15} />
          </button>

          {p.genuineness_status !== 'verified' && (
            <button
              onClick={() => handleVerifyGenuineness(p, 'verified')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors border border-emerald-200 dark:border-emerald-800"
              title="Verify Deed Genuineness"
            >
              <ShieldCheck size={13} />
              <span>Verify</span>
            </button>
          )}

          {p.genuineness_status === 'pending_check' && (
            <button
              onClick={() => handleVerifyGenuineness(p, 'flagged_discrepancy')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Flag Ownership Discrepancy"
            >
              <ShieldAlert size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Properties Overview &amp; Genuineness Verification
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Read-only platform registry of all enrolled rental units with deed integrity checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Total Enrolled: <strong className="text-slate-800 dark:text-white">{paginatedProperties?.total || 0}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by property name, address, city, or landlord..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={genuinenessFilter}
            onChange={(e) => {
              setGenuinenessFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Genuineness States</option>
            <option value="verified">Verified Deeds</option>
            <option value="pending_check">Pending Verification</option>
            <option value="flagged_discrepancy">Flagged Discrepancy</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <DataTable
        columns={columns}
        data={paginatedProperties?.items || []}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => setSelectedProperty(p)}
        emptyMessage={loading ? 'Loading property registry...' : 'No properties found matching criteria.'}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, paginatedProperties?.total || 0)} of {paginatedProperties?.total} properties
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
      {/* PROPERTY DETAIL DRAWER (Read-Only) */}
      {/* ======================================================== */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedProperty.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {selectedProperty.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Genuineness Banner */}
              <div
                className={cn(
                  'p-4 rounded-xl border space-y-2',
                  selectedProperty.genuineness_status === 'verified'
                    ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                    : selectedProperty.genuineness_status === 'flagged_discrepancy'
                    ? 'bg-red-50/60 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                    : 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      Deed &amp; Ownership Verification
                    </span>
                  </div>
                  <span className="font-semibold capitalize text-xs">
                    {selectedProperty.genuineness_status.replace('_', ' ')}
                  </span>
                </div>

                {selectedProperty.verified_deed_hash && (
                  <p className="font-mono text-[10px] text-slate-500 break-all">
                    Ledger Hash: {selectedProperty.verified_deed_hash}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyGenuineness(selectedProperty, 'verified')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    Confirm Deed Verified
                  </button>
                  <button
                    onClick={() => handleVerifyGenuineness(selectedProperty, 'flagged_discrepancy')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                  >
                    Flag Ownership Issue
                  </button>
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Property Parameters
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProperty.address}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">City / Region</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProperty.city}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ${selectedProperty.monthly_rent} / month
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Security Deposit</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ${selectedProperty.security_deposit}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Units Inspected</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProperty.inspections_count} cycles
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block text-[10px]">Last Inspection</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedProperty.last_inspection_date
                        ? new Date(selectedProperty.last_inspection_date).toLocaleDateString()
                        : 'None recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stakeholders */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Enrolled Stakeholders
                </h4>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Landlord</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedProperty.landlord_name}
                      </p>
                      <p className="text-slate-500">{selectedProperty.landlord_email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Owner
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Current Tenant</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedProperty.tenant_name || 'No active lease'}
                      </p>
                      {selectedProperty.tenant_email && (
                        <p className="text-slate-500">{selectedProperty.tenant_email}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      Occupant
                    </span>
                  </div>
                </div>
              </div>

              {/* Read Only Notice */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
                Admin oversight for properties is strictly read-only and compliance-oriented. Property creation, lease agreements, and tenancy terminations are initiated directly by landlords and tenants.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertiesPage;
