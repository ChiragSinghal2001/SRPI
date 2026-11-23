import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Camera,
  UploadCloud,
  X,
  MessageSquare,
  DollarSign,
  ChevronLeft,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { inspectionService } from '../../services/inspectionService';
import { disputeService } from '../../services/disputeService';
import { InspectionFinding } from '../../types/inspection';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import StatusChip from '../../components/common/StatusChip';
import ConfidenceBadge from '../../components/common/ConfidenceBadge';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { compressImage } from '../../utils/imageCompressor';

export const TenantReportViewerPage: React.FC = () => {
  const { id = 'insp_101' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Dispute modal state
  const [disputeTargetItem, setDisputeTargetItem] = useState<InspectionFinding | null>(null);
  const [tenantComment, setTenantComment] = useState('');
  const [counterPhotoUrl, setCounterPhotoUrl] = useState<string | null>(null);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const { data: inspection, loading, refetch } = useFetch(
    () => inspectionService.getInspectionById(id),
    [id]
  );

  const handleOpenDisputeModal = (item: InspectionFinding) => {
    setDisputeTargetItem(item);
    setTenantComment('');
    setCounterPhotoUrl(null);
  };

  const handleCounterPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1600, 1200, 0.8);
      setCounterPhotoUrl(compressed.dataUrl);
      dispatch(
        addToast({
          type: 'success',
          title: 'Counter Photo Staged',
          message: 'Image compressed and attached to dispute claim.',
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Photo Upload Failed',
        })
      );
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTargetItem || !inspection) return;

    setIsSubmittingDispute(true);
    try {
      await disputeService.createDispute({
        inspectionId: inspection.id,
        propertyId: inspection.propertyId,
        propertyName: inspection.propertyName,
        unit: inspection.unit,
        tenantId: user?.id || 'usr_tenant_1',
        tenantName: user?.name || 'Resident',
        room: disputeTargetItem.room,
        object: disputeTargetItem.object,
        assessedAmount: disputeTargetItem.landlordReview.estimatedCost || 100,
        tenantComment,
        counterPhotoUrl: counterPhotoUrl || undefined,
      });

      dispatch(
        addToast({
          type: 'success',
          title: 'Dispute Submitted',
          message: 'Your dispute claim and counter-evidence have been sent to the property manager.',
        })
      );

      setDisputeTargetItem(null);
      navigate('/tenant/disputes');
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to submit dispute',
        })
      );
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const isAuthorized =
    !inspection ||
    inspection.tenantId === user?.id ||
    (user?.id === 'usr_tenant_1' && inspection.tenantId === 'usr_tenant_1') ||
    (user?.email && inspection.tenantEmail?.toLowerCase() === user.email.toLowerCase());

  if (loading || !inspection) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <AlertOctagon size={48} className="mx-auto text-amber-500 opacity-90" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This inspection report belongs to another tenant or rental property. You are not authorized to view or dispute this document.
        </p>
        <button
          type="button"
          onClick={() => navigate('/tenant')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
        >
          Return to Tenant Home
        </button>
      </div>
    );
  }

  const findings = inspection.findings || [];
  const totalDeductions = findings.reduce(
    (acc, f) => acc + (f.landlordReview.estimatedCost || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/tenant')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ChevronLeft size={16} /> Back to Tenant Home
      </button>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Tenant Read-Only Review
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Condition Inspection Report — Unit {inspection.unit}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic Hash Seal: {inspection.reportHash ? `${inspection.reportHash.slice(0, 20)}...` : 'Sealed'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Proposed Deductions</span>
          <span className="text-2xl font-black text-red-600 font-mono">
            ${totalDeductions.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Findings List with Dispute Button */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Photographic Evidence & Landlord Findings
          </h2>
          <span className="text-xs text-slate-500">
            Click &ldquo;Dispute This Item&rdquo; if you disagree with any assessed damage
          </span>
        </div>

        {findings.map((item, idx) => {
          const isFlaggedOrDamaged =
            item.landlordReview.status === 'flagged' || item.landlordReview.status === 'damaged';

          return (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-base capitalize text-slate-900 dark:text-white">
                    {item.room} — {item.object}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <StatusChip status={item.landlordReview.status} size="sm" />
                  {item.landlordReview.estimatedCost ? (
                    <span className="font-bold font-mono text-red-600 text-sm">
                      -${item.landlordReview.estimatedCost.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Side-by-side Evidence Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Your Move-in Baseline
                  </span>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <img
                      src={item.beforeImageUrl || item.afterImageUrl}
                      alt="Baseline"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase">
                    Move-out Inspection
                  </span>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <img
                      src={item.afterImageUrl}
                      alt="Move-out"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Finding notes */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                <span className="text-slate-500 font-semibold block">Inspection Finding:</span>
                <p className="text-slate-800 dark:text-slate-200">
                  {item.landlordReview.notes || item.aiFinding.description}
                </p>
              </div>

              {/* Dispute Button */}
              {isFlaggedOrDamaged && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenDisputeModal(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <AlertOctagon size={14} /> Dispute This Item
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DISPUTE FORM MODAL */}
      {disputeTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Raise Tenant Dispute Claim
                </span>
                <h3 className="font-bold text-base capitalize text-slate-900 dark:text-white mt-0.5">
                  {disputeTargetItem.room} — {disputeTargetItem.object}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDisputeTargetItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                You are disputing a{' '}
                <strong>
                  ${disputeTargetItem.landlordReview.estimatedCost || 0} deduction
                </strong>
                . Provide an explanation and optional counter-evidence photo (e.g. proof the scratch
                existed prior to your lease).
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Explanation / Justification
                </label>
                <textarea
                  required
                  rows={4}
                  value={tenantComment}
                  onChange={(e) => setTenantComment(e.target.value)}
                  placeholder="Explain why this damage should not be deducted from your deposit..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Upload Counter Photo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Counter-Photo Evidence (Optional)
                </label>

                {counterPhotoUrl ? (
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-700 max-w-xs">
                    <img
                      src={counterPhotoUrl}
                      alt="Counter photo preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCounterPhotoUrl(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer bg-slate-50 dark:bg-slate-800/50">
                    <Camera size={22} className="text-amber-600 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tap to attach photo
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Client compresses image automatically
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCounterPhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDisputeTargetItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmittingDispute ? 'Submitting...' : 'Submit Official Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantReportViewerPage;
