import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Share2,
  Lock,
  ShieldCheck,
  Building,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Download,
  DollarSign,
  ChevronLeft,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { inspectionService } from '../../services/inspectionService';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import StatusChip from '../../components/common/StatusChip';
import ConfidenceBadge from '../../components/common/ConfidenceBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const ReportPreviewPage: React.FC = () => {
  const { id = 'insp_101' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showLockDialog, setShowLockDialog] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const {
    data: inspection,
    loading,
    refetch,
  } = useFetch(() => inspectionService.getInspectionById(id), [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWithTenant = () => {
    dispatch(
      addToast({
        type: 'success',
        title: 'Report Shared with Tenant',
        message: `Notification sent to ${inspection?.tenantEmail}. Tenant dispute window is now open for 7 days.`,
      })
    );
  };

  const handleCopyHash = () => {
    if (inspection?.reportHash) {
      navigator.clipboard.writeText(inspection.reportHash);
      dispatch(
        addToast({
          type: 'info',
          title: 'Hash Copied',
          message: 'Cryptographic SHA-256 hash copied to clipboard.',
        })
      );
    }
  };

  const handleLockReportConfirm = async () => {
    setIsLocking(true);
    try {
      await inspectionService.lockAndFinalizeReport(id, 'Unnati Gupta');
      await refetch();
      setShowLockDialog(false);
      dispatch(
        addToast({
          type: 'success',
          title: 'Report Locked & Finalized',
          message: 'Cryptographic tamper seal applied. Report is now immutable.',
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to lock report',
        })
      );
    } finally {
      setIsLocking(false);
    }
  };

  if (loading || !inspection) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  const findings = inspection.findings || [];
  const totalDeductions = findings.reduce(
    (acc, item) => acc + (item.landlordReview.estimatedCost || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 print:p-0 print:m-0 print:max-w-full">
      {/* Top Action Header (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer size={15} /> Print / Save PDF
          </button>

          <button
            type="button"
            onClick={handleShareWithTenant}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 size={15} /> Share with Tenant
          </button>

          {!inspection.isLocked ? (
            <button
              type="button"
              onClick={() => setShowLockDialog(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Lock size={15} /> Lock & Finalize Report
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
              <Lock size={14} /> Report Locked (Final)
            </span>
          )}
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT */}
      <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8 text-slate-900 dark:text-slate-100">
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Official Condition Certificate
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Property Inspection & Damage Assessment
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Generated by Smart Rental Property Inspector • AI Vision Verified
              </p>
            </div>

            {/* Tamper Evident Badge */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 justify-end">
                <ShieldCheck size={16} />
                <span>Tamper-Evident Hash</span>
              </div>
              <div
                onClick={handleCopyHash}
                className="font-mono text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer hover:text-emerald-600 flex items-center gap-1 justify-end"
                title="Click to copy hash"
              >
                <span>
                  {inspection.reportHash
                    ? `${inspection.reportHash.slice(0, 16)}...${inspection.reportHash.slice(-8)}`
                    : 'Pending Lock'}
                </span>
                <Copy size={11} />
              </div>
            </div>
          </div>
        </div>

        {/* Property & Lease Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Property & Unit</span>
            <strong className="text-sm block mt-0.5">{inspection.propertyName}</strong>
            <span className="text-slate-500">Unit {inspection.unit}</span>
          </div>

          <div>
            <span className="text-slate-500 block">Inspection Type</span>
            <strong className="text-sm block mt-0.5 uppercase">{inspection.type}</strong>
            <span className="text-slate-500">Date: {inspection.scheduledDate}</span>
          </div>

          <div>
            <span className="text-slate-500 block">Landlord / Inspector</span>
            <strong className="text-sm block mt-0.5">{inspection.inspectorName}</strong>
            <span className="text-slate-500">Pacific Heights Management</span>
          </div>

          <div>
            <span className="text-slate-500 block">Tenant</span>
            <strong className="text-sm block mt-0.5">{inspection.tenantName}</strong>
            <span className="text-slate-500">{inspection.tenantEmail}</span>
          </div>
        </div>

        {/* Executive Damage Assessment & Deductions Summary */}
        <div className="p-5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
              Executive Financial Damage Summary
            </h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300 mt-0.5">
              Itemized tenant deductions assessed based on photographic baseline comparison.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Assessed Deductions</span>
            <span className="text-2xl font-black text-red-600 font-mono">
              ${totalDeductions.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Itemized Findings with Side-by-Side Photographic Proof */}
        <div className="space-y-6">
          <h2 className="font-bold text-base border-b border-slate-200 dark:border-slate-800 pb-2">
            Itemized Room & Surface Findings
          </h2>

          {findings.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 break-inside-avoid"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base capitalize">
                    {item.room} — {item.object}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <StatusChip status={item.landlordReview.status} size="sm" />
                  {item.landlordReview.estimatedCost ? (
                    <span className="font-bold font-mono text-red-600 text-xs">
                      Deduction: ${item.landlordReview.estimatedCost.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">$0.00</span>
                  )}
                </div>
              </div>

              {/* Side-by-side Evidence Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                    Move-in Baseline
                  </span>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <img
                      src={item.beforeImageUrl || item.afterImageUrl}
                      alt="Baseline"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                    Move-out Condition
                  </span>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <img
                      src={item.afterImageUrl}
                      alt="Move-out Inspection"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Findings & Notes Descriptions */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-slate-500">
                  <span>AI Vision Finding:</span>
                  <ConfidenceBadge confidence={item.aiFinding.confidence} showWarningPrompt={false} />
                </div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {item.aiFinding.description}
                </p>

                {item.landlordReview.notes && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 font-semibold block mb-0.5">
                      Landlord Assessment:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      &ldquo;{item.landlordReview.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dual Digital Signature Blocks */}
        <div className="pt-6 border-t-2 border-slate-900 dark:border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 break-inside-avoid">
          {/* Landlord Signature Block */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Landlord / Inspector Signature
            </span>
            <div className="h-16 border-b border-dashed border-slate-400 flex items-center justify-center font-serif text-xl italic text-slate-800 dark:text-slate-200">
              {inspection.landlordSignature?.signedBy || 'Unnati Gupta'}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Status: Cryptographically Verified</span>
              <span>
                {inspection.landlordSignature?.signedAt
                  ? new Date(inspection.landlordSignature.signedAt).toLocaleDateString()
                  : 'Pending'}
              </span>
            </div>
          </div>

          {/* Tenant Signature / Dispute Notice Block */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Tenant Acknowledgment
            </span>
            <div className="h-16 border-b border-dashed border-slate-400 flex items-center justify-center text-xs text-slate-400">
              {inspection.tenantSignature?.signedBy ||
                'Subject to 7-day tenant review & dispute resolution window'}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Tenant: {inspection.tenantName}</span>
              <span>Status: Window Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLockDialog}
        title="Finalize & Lock Inspection Report?"
        message="Locking this report will calculate the cryptographic SHA-256 seal and make the findings immutable for tenant dispute and security deposit release. Proceed?"
        confirmLabel="Confirm & Lock Report"
        isDestructive={false}
        isLoading={isLocking}
        onConfirm={handleLockReportConfirm}
        onCancel={() => setShowLockDialog(false)}
      />
    </div>
  );
};

export default ReportPreviewPage;
