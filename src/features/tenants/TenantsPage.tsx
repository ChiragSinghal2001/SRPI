import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Home,
  Calendar,
  CheckCircle2,
  X,
  FileCheck2,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { propertyService } from '../../services/propertyService';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const TenantsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedPropertyId, setSelectedPropertyId] = useState('prop_3');
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [leaseStart, setLeaseStart] = useState('2026-12-01');
  const [leaseEnd, setLeaseEnd] = useState('2027-11-30');
  const [deposit, setDeposit] = useState('2500');
  const [rent, setRent] = useState('2100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties, loading, refetch } = useFetch(
    () => propertyService.getProperties(),
    []
  );

  const handleAssignTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await propertyService.updateProperty(selectedPropertyId, {
        status: 'occupied',
        currentTenant: {
          id: `usr_tenant_${Date.now()}`,
          name: tenantName,
          email: tenantEmail,
          phone: tenantPhone,
          leaseStartDate: leaseStart,
          leaseEndDate: leaseEnd,
          depositAmount: parseFloat(deposit),
          monthlyRent: parseFloat(rent),
        },
      });

      await refetch();
      setShowAssignModal(false);
      dispatch(
        addToast({
          type: 'success',
          title: 'Tenant Lease Assigned',
          message: `${tenantName} has been assigned to the property.`,
        })
      );

      setTenantName('');
      setTenantEmail('');
      setTenantPhone('');
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to assign tenant',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Tenant Directory & Leases
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assign renters, manage lease periods, and track move-in inspection sign-offs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAssignModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus size={15} /> Assign Tenant to Property
        </button>
      </div>

      {/* Tenants Table Grid */}
      {loading ? (
        <div className="space-y-3">
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties
            ?.filter((p) => p.currentTenant)
            .map((prop) => {
              const tenant = prop.currentTenant!;

              return (
                <div
                  key={prop.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {prop.name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {tenant.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Active Lease
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{tenant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home size={13} className="text-slate-400" />
                      <span>{prop.address} (Unit {prop.unit})</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Monthly Rent</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        ${tenant.monthlyRent}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Deposit Held</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        ${tenant.depositAmount}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar size={13} />
                    Lease: {tenant.leaseStartDate} to {tenant.leaseEndDate}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Assign Tenant Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Assign Tenant to Rental Unit
              </h2>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Property Unit
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                >
                  {properties?.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name} ({prop.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tenant Full Name
                </label>
                <input
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="e.g. Alex Wong"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    required
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lease Start Date
                  </label>
                  <input
                    required
                    type="date"
                    value={leaseStart}
                    onChange={(e) => setLeaseStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lease End Date
                  </label>
                  <input
                    required
                    type="date"
                    value={leaseEnd}
                    onChange={(e) => setLeaseEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent ($)
                  </label>
                  <input
                    required
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deposit Amount ($)
                  </label>
                  <input
                    required
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  {isSubmitting ? 'Assigning...' : 'Confirm Lease Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsPage;
