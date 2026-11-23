import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Image as ImageIcon,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { disputeService } from '../../services/disputeService';
import { DisputeItem } from '../../types/dispute';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { propertyService } from '../../services/propertyService';
import { addToast } from '../../store/slices/uiSlice';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const DisputesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties } = useFetch(
    () => propertyService.getProperties({ landlordId: user?.id }),
    [user?.id]
  );
  const propertyIds = properties?.map((p) => p.id) || [];

  const { data: disputes, loading, refetch } = useFetch(
    () =>
      propertyIds.length > 0
        ? disputeService.getDisputes({ propertyIds })
        : Promise.resolve([]),
    [propertyIds.join(',')]
  );

  const activeDispute = disputes?.find((d) => d.id === selectedDisputeId) || disputes?.[0];

  const handleResolve = async (action: 'accept' | 'reject') => {
    if (!activeDispute) return;
    setIsSubmitting(true);

    try {
      await disputeService.resolveDispute(
        activeDispute.id,
        action,
        resolutionReason || (action === 'accept' ? 'Claim accepted based on move-in records.' : 'Charge upheld based on clear photographic damage evidence.')
      );

      await refetch();
      setResolutionReason('');
      dispatch(
        addToast({
          type: action === 'accept' ? 'success' : 'info',
          title: action === 'accept' ? 'Dispute Accepted' : 'Dispute Rejected',
          message: `Dispute for ${activeDispute.room} ${activeDispute.object} marked as ${action}ed.`,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to resolve dispute',
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
            Tenant Damage Disputes Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review tenant counter-evidence photos, statements, and issue deposit adjustments
          </p>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : !disputes || disputes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <AlertOctagon size={36} className="mx-auto text-slate-400 mb-2 opacity-50" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No Tenant Disputes on File
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            There are currently no deduction challenges or damage disputes filed for your properties.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Disputes List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Dispute Tickets ({disputes?.length || 0})
            </h2>

            {disputes?.map((item) => {
              const isSelected = item.id === activeDispute?.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDisputeId(item.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        {item.propertyName} (Unit {item.unit || '4B'})
                      </span>
                      <h3 className="font-bold text-sm capitalize text-slate-900 dark:text-white">
                        {item.room} — {item.object}
                      </h3>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'open'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : item.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    &ldquo;{item.tenantComment}&rdquo;
                  </p>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400">By {item.tenantName}</span>
                    <span className="font-bold text-red-600 font-mono">
                      Disputed: ${item.assessedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dispute Resolution Stage (7 cols) */}
          {activeDispute && (
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Dispute ID #{activeDispute.id}
                  </span>
                  <h2 className="text-lg font-bold capitalize text-slate-900 dark:text-white mt-0.5">
                    {activeDispute.room} — {activeDispute.object}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Filed by {activeDispute.tenantName} on{' '}
                    {new Date(activeDispute.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Deduction In Dispute</span>
                  <span className="text-xl font-black text-red-600 font-mono">
                    ${activeDispute.assessedAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Tenant Statement */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <MessageSquare size={13} /> Tenant Claim Statement
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  &ldquo;{activeDispute.tenantComment}&rdquo;
                </p>
              </div>

              {/* Counter Evidence Photo */}
              {activeDispute.counterPhotoUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <ImageIcon size={13} /> Tenant Counter-Photo Evidence
                  </span>
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700 max-w-md">
                    <img
                      src={activeDispute.counterPhotoUrl}
                      alt="Counter photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Resolution Form or Result */}
              {activeDispute.status === 'open' ? (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Landlord Resolution Explanation (Mandatory for record)
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionReason}
                    onChange={(e) => setResolutionReason(e.target.value)}
                    placeholder="State reason for accepting or rejecting this dispute..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-emerald-500"
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleResolve('accept')}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Accept Dispute (Waive Fee)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve('reject')}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Reject Dispute (Maintain Charge)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Resolution Status: {activeDispute.status.toUpperCase()}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {activeDispute.landlordResolutionNote || 'Resolved by landlord.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisputesPage;
