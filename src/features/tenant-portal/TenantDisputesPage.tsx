import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  DollarSign,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { disputeService } from '../../services/disputeService';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const TenantDisputesPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: disputes, loading } = useFetch(
    () => disputeService.getDisputes({ tenantId: 'usr_tenant_1' }),
    []
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
          Your Submitted Dispute Claims
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track the formal review status of deduction challenges submitted to property management.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-4">
          {disputes?.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              You have no active disputes on file.
            </div>
          ) : (
            disputes?.map((disp) => (
              <div
                key={disp.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      Ticket #{disp.id}
                    </span>
                    <h3 className="font-bold text-base capitalize text-slate-900 dark:text-white mt-0.5">
                      {disp.room} — {disp.object}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        disp.status === 'open'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : disp.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {disp.status}
                    </span>
                    <span className="font-bold font-mono text-red-600 text-sm">
                      ${disp.assessedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tenant Claim */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-500 block">Your Stated Reason:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic">
                    &ldquo;{disp.tenantComment}&rdquo;
                  </p>
                </div>

                {/* Counter Photo if uploaded */}
                {disp.counterPhotoUrl && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Attached Counter-Photo:
                    </span>
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 max-w-xs border border-slate-200 dark:border-slate-700">
                      <img
                        src={disp.counterPhotoUrl}
                        alt="Counter evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Landlord Resolution Feedback */}
                {disp.landlordResolutionNote && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Landlord Resolution Verdict:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">
                      {disp.landlordResolutionNote}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TenantDisputesPage;
