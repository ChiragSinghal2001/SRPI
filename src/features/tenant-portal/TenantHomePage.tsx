import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FileCheck2,
  Calendar,
  DollarSign,
  AlertOctagon,
  Wrench,
  ChevronRight,
  ShieldCheck,
  User,
  Building,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { propertyService } from '../../services/propertyService';
import { inspectionService } from '../../services/inspectionService';
import { disputeService } from '../../services/disputeService';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const TenantHomePage: React.FC = () => {
  const navigate = useNavigate();

  const { data: properties, loading: propLoading } = useFetch(
    () => propertyService.getProperties(),
    []
  );

  const { data: inspections, loading: inspLoading } = useFetch(
    () => inspectionService.getInspections({ tenantId: 'usr_tenant_1' }),
    []
  );

  const { data: disputes, loading: dispLoading } = useFetch(
    () => disputeService.getDisputes({ tenantId: 'usr_tenant_1' }),
    []
  );

  const property = properties?.[0]; // Sarah Miller's leased unit (Unit 4B)
  const tenant = property?.currentTenant;

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Tenant Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome home, {tenant?.name || 'Sarah'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Access your verified condition reports, lease records, and dispute resolutions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tenant/reports/insp_101')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors"
        >
          View Latest Inspection Report &rarr;
        </button>
      </div>

      {/* Leased Unit Card */}
      {property && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 shrink-0">
            <img
              src={property.imageUrl}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                Your Current Lease
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {property.name} (Unit {property.unit})
              </h2>
              <p className="text-xs text-slate-500">{property.address}, {property.city}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block font-medium">Monthly Rent</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  ${tenant?.monthlyRent}/mo
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block font-medium">Security Deposit</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  ${tenant?.depositAmount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block font-medium">Lease Term</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {tenant?.leaseStartDate} to {tenant?.leaseEndDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports & Open Claims Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inspection Reports List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 size={16} className="text-emerald-600" />
              Inspection Certificates
            </h3>
            <span className="text-xs text-slate-400">
              {inspections?.length || 0} Reports Available
            </span>
          </div>

          <div className="space-y-3">
            {inspections?.map((insp) => (
              <div
                key={insp.id}
                onClick={() => navigate(`/tenant/reports/${insp.id}`)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white capitalize">
                    {insp.type.replace('_', ' ')} Inspection
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Conducted: {insp.scheduledDate} • {insp.findings?.length || 0} Items Documented
                  </p>
                </div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  View Report <ChevronRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Claims Tracking */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon size={16} className="text-amber-600" />
              Your Active Disputes
            </h3>
            <button
              type="button"
              onClick={() => navigate('/tenant/disputes')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              All Disputes
            </button>
          </div>

          <div className="space-y-3">
            {disputes?.map((disp) => (
              <div
                key={disp.id}
                className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold capitalize text-slate-900 dark:text-white">
                    {disp.room} — {disp.object}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                    {disp.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  &ldquo;{disp.tenantComment}&rdquo;
                </p>
                <span className="text-red-600 font-bold block pt-1">
                  Disputed Amount: ${disp.assessedAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantHomePage;
