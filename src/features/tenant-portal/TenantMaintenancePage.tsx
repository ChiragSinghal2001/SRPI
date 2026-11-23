import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, CheckCircle2, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useAppSelector } from '../../hooks/useRedux';
import { maintenanceService } from '../../services/maintenanceService';
import { propertyService } from '../../services/propertyService';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const TenantMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { data: properties } = useFetch(() => propertyService.getProperties(), []);
  const activeLeasedProperty = properties?.find(
    (p) =>
      p.currentTenant &&
      (p.currentTenant.id === user?.id ||
        (user?.email && p.currentTenant.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.id === 'usr_tenant_1' && p.currentTenant.id === 'usr_tenant_1'))
  );

  const { data: tickets, loading } = useFetch(
    () =>
      maintenanceService.getTickets(
        activeLeasedProperty ? { propertyId: activeLeasedProperty.id } : undefined
      ),
    [activeLeasedProperty?.id]
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <button
        type="button"
        onClick={() => navigate('/tenant')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ChevronLeft size={16} /> Back to Tenant Home
      </button>

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Scheduled Property Maintenance & Repairs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time status of contractor work orders and repairs scheduled for your rental home.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-4">
          {tickets?.map((ticket) => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    {ticket.propertyName}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ticket.status === 'done'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : ticket.status === 'in_progress'
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {ticket.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  {ticket.description}
                </p>
                {ticket.targetCompletionDate && (
                  <span className="text-[11px] text-slate-400 block pt-1">
                    Est. Completion Date: {ticket.targetCompletionDate}
                  </span>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-medium">Assigned Service</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {ticket.assignedVendor || 'Property Management Team'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantMaintenancePage;
