import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Edit3,
  DollarSign,
  Save,
  RotateCcw,
  Layers,
  HelpCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import { useFetch } from '../../hooks/useFetch';
import { usePolling } from '../../hooks/usePolling';
import { inspectionService } from '../../services/inspectionService';
import { aiService, AIJobStatusResponse } from '../../services/aiService';
import {
  InspectionFinding,
  ConditionStatus,
  DamageSeverity,
} from '../../types/inspection';
import StatusChip from '../../components/common/StatusChip';
import ConfidenceBadge from '../../components/common/ConfidenceBadge';
import BeforeAfterSlider from '../../components/common/BeforeAfterSlider';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { cn } from '../../utils/cn';
import { useAppSelector } from '../../hooks/useRedux';
import { propertyService } from '../../services/propertyService';

export const AIReviewPage: React.FC = () => {
  const { id = 'insp_101' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Selected finding ID for the active detail review stage
  const [selectedFindingId, setSelectedFindingId] = useState<string>('find_1');

  // Simulated AI Job Polling demo state
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // 1. Component Data Fetching with custom useFetch hook
  const {
    data: inspection,
    loading: inspectionLoading,
    error: inspectionError,
    refetch: refetchInspection,
  } = useFetch(() => inspectionService.getInspectionById(id), [id]);

  const { data: properties } = useFetch(
    () =>
      user?.role === 'LANDLORD'
        ? propertyService.getProperties({ landlordId: user?.id })
        : Promise.resolve([]),
    [user?.id]
  );
  const propertyIds = properties?.map((p) => p.id) || [];
  const isAuthorized =
    !inspection ||
    (user?.role === 'LANDLORD'
      ? propertyIds.includes(inspection.propertyId)
      : inspection.tenantId === user?.id ||
        (user?.email && inspection.tenantEmail?.toLowerCase() === user.email.toLowerCase()));

  // 2. AI Job Status Polling with custom usePolling hook
  const {
    data: pollData,
    loading: pollLoading,
    isPolling,
  } = usePolling<AIJobStatusResponse>(() => aiService.getJobStatus(activeJobId || 'job_demo'), {
    enabled: !!activeJobId,
    intervalMs: 3500, // 3.5s within 3-5s requirement
    onCompleted: (result) => {
      dispatch(
        addToast({
          type: 'success',
          title: 'AI Processing Complete',
          message: `Analyzed ${result.processedCount} images. Ready for landlord sign-off.`,
        })
      );
      refetchInspection();
    },
  });

  const findings = inspection?.findings || [];
  const currentFinding = findings.find((f) => f.id === selectedFindingId) || findings[0];

  // Local state for landlord override form
  const [editStatus, setEditStatus] = useState<ConditionStatus>(
    currentFinding?.landlordReview.status || 'flagged'
  );
  const [editSeverity, setEditSeverity] = useState<DamageSeverity | undefined>(
    currentFinding?.landlordReview.severity || 'minor'
  );
  const [editNotes, setEditNotes] = useState<string>(
    currentFinding?.landlordReview.notes || ''
  );
  const [editCost, setEditCost] = useState<number>(
    currentFinding?.landlordReview.estimatedCost || 0
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync edit form when selected finding changes
  React.useEffect(() => {
    if (currentFinding) {
      setEditStatus(currentFinding.landlordReview.status);
      setEditSeverity(currentFinding.landlordReview.severity);
      setEditNotes(currentFinding.landlordReview.notes);
      setEditCost(currentFinding.landlordReview.estimatedCost || 0);
    }
  }, [currentFinding]);

  const handleSaveOverride = async () => {
    if (!currentFinding) return;
    setIsSaving(true);

    try {
      await inspectionService.updateFindingReview(id, currentFinding.id, {
        status: editStatus,
        severity: editSeverity,
        notes: editNotes,
        estimatedCost: editCost,
      });

      // Refetch via custom useFetch hook to ensure UI stays strictly fresh
      await refetchInspection();

      dispatch(
        addToast({
          type: 'success',
          title: 'Review Updated',
          message: `Saved landlord override for ${currentFinding.room} ${currentFinding.object}.`,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Unable to save landlord override.',
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerSimulatedPoll = async () => {
    const { jobId } = await aiService.triggerComparisonJob(id, 6);
    setActiveJobId(jobId);
    dispatch(
      addToast({
        type: 'info',
        title: 'AI Job Started',
        message: 'Polling status endpoint every 3.5s...',
      })
    );
  };

  if (inspectionLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (inspection && !isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <ShieldAlert size={48} className="mx-auto text-amber-500 opacity-90" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This AI damage review session belongs to another property. You are not authorized to view or edit this inspection.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (inspectionError || !inspection) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-red-200">
        <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold">Failed to load inspection</h2>
        <p className="text-xs text-slate-500 mt-1">
          {inspectionError?.message || 'Inspection session not found'}
        </p>
        <button
          onClick={() => refetchInspection()}
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Calculate summary counts
  const totalFindings = findings.length;
  const goodCount = findings.filter((f) => f.landlordReview.status === 'good').length;
  const flaggedCount = findings.filter((f) => f.landlordReview.status === 'flagged').length;
  const damagedCount = findings.filter((f) => f.landlordReview.status === 'damaged').length;
  const totalDeductions = findings.reduce(
    (sum, f) => sum + (f.landlordReview.estimatedCost || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
              <Sparkles size={13} /> AI Damage Comparison
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Unit {inspection.unit} • {inspection.propertyName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Move-out Damage Triage & Review
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulated Poll trigger for test demonstration */}
          <button
            type="button"
            onClick={handleTriggerSimulatedPoll}
            disabled={isPolling}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Clock size={14} />
            {isPolling ? 'Polling AI Job...' : 'Re-run AI Job (Poll Demo)'}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/reports/${inspection.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <FileCheck2 size={16} /> Generate Final Report
          </button>
        </div>
      </div>

      {/* AI Processing Banner (Driven by usePolling hook) */}
      {isPolling && pollData && (
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-purple-600 animate-spin" />
              AI Model Processing: {pollData.progress}%
            </span>
            <span className="font-mono">
              {pollData.processedCount} / {pollData.totalCount} Pairs Analyzed
            </span>
          </div>
          <div className="w-full bg-purple-200 dark:bg-purple-900/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${pollData.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-purple-700 dark:text-purple-300">
            {pollData.currentImage || 'Comparing surface matrices with baseline photos...'}
          </p>
        </div>
      )}

      {/* SUMMARY MATRIX TABLE (Wall, Door, Window, Floor per room) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Property Surface Status Overview
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              ✓ Good: {goodCount}
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              ⚠ Flagged: {flaggedCount}
            </span>
            <span className="text-red-700 dark:text-red-400 font-semibold">
              ✗ Damaged: {damagedCount}
            </span>
            <span className="font-bold text-slate-900 dark:text-white pl-2 border-l border-slate-200 dark:border-slate-700">
              Total Deductions: ${totalDeductions.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Object</th>
                <th className="py-2.5 px-3">AI Finding</th>
                <th className="py-2.5 px-3">AI Conf.</th>
                <th className="py-2.5 px-3">Final Status</th>
                <th className="py-2.5 px-3">Deduction</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {findings.map((item) => {
                const isSelected = item.id === currentFinding?.id;
                const isLowConf = item.aiFinding.confidence < 0.7;

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFindingId(item.id)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.room}
                    </td>
                    <td className="py-2.5 px-3 capitalize font-medium">{item.object}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {item.aiFinding.description}
                    </td>
                    <td className="py-2.5 px-3">
                      <ConfidenceBadge
                        confidence={item.aiFinding.confidence}
                        showWarningPrompt={false}
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusChip status={item.landlordReview.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium">
                      ${item.landlordReview.estimatedCost || 0}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-md transition-colors',
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                        )}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CORE INSPECT STAGE: Before/After Slider + Landlord Triage Overrides */}
      {currentFinding && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Interactive Slider Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                  <Layers size={18} className="text-emerald-600" />
                  {currentFinding.room} — {currentFinding.object}
                </h3>
                <p className="text-xs text-slate-500">
                  Compare move-in baseline against move-out capture
                </p>
              </div>

              <ConfidenceBadge
                confidence={currentFinding.aiFinding.confidence}
                showWarningPrompt={true}
              />
            </div>

            {/* Draggable Split Slider Component */}
            <BeforeAfterSlider
              beforeImage={currentFinding.beforeImageUrl || currentFinding.afterImageUrl}
              afterImage={currentFinding.afterImageUrl}
              beforeLabel="Baseline: Jan 15, 2025"
              afterLabel="Inspection: Nov 18, 2026"
            />

            {/* AI Finding Callout Box */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  Original AI Detection
                </span>
                <StatusChip status={currentFinding.aiFinding.status} size="sm" />
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                &ldquo;{currentFinding.aiFinding.description}&rdquo;
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>
                  Severity:{' '}
                  <strong className="text-slate-700 dark:text-slate-300 uppercase">
                    {currentFinding.aiFinding.severity || 'None'}
                  </strong>
                </span>
                <span>
                  Confidence:{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {Math.round(currentFinding.aiFinding.confidence * 100)}%
                  </strong>
                </span>
              </div>
            </div>

            {/* Warning when confidence < 70% */}
            {currentFinding.aiFinding.confidence < 0.7 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Manual Landlord Review Mandated:</span> The AI vision
                  engine match confidence is below 70% (
                  {Math.round(currentFinding.aiFinding.confidence * 100)}%). Please inspect this
                  surface closely and adjust the status accordingly.
                </div>
              </div>
            )}
          </div>

          {/* Right 5 Columns: Landlord Triage & Override Form */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit3 size={16} className="text-emerald-600" />
                Landlord Override & Cost Triage
              </h3>

              {currentFinding.landlordReview.isEdited && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                  Edited by Landlord
                </span>
              )}
            </div>

            {/* Status Override */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Override Condition Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditStatus('good')}
                  className={cn(
                    'py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                    editStatus === 'good'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  )}
                >
                  <CheckCircle2 size={13} /> Good
                </button>

                <button
                  type="button"
                  onClick={() => setEditStatus('flagged')}
                  className={cn(
                    'py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                    editStatus === 'flagged'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  )}
                >
                  <AlertTriangle size={13} /> Flagged
                </button>

                <button
                  type="button"
                  onClick={() => setEditStatus('damaged')}
                  className={cn(
                    'py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                    editStatus === 'damaged'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  )}
                >
                  <ShieldAlert size={13} /> Damaged
                </button>
              </div>
            </div>

            {/* Severity Picker */}
            {editStatus !== 'good' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Damage Severity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minor', 'moderate', 'major'] as DamageSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setEditSeverity(sev)}
                      className={cn(
                        'py-1.5 rounded-lg border text-xs capitalize font-medium transition-all',
                        editSeverity === sev
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Repair Cost Assessment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Deduction Cost ($ USD)
              </label>
              <div className="relative">
                <DollarSign
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={editCost}
                  onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 font-mono"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Will be deducted from tenant deposit if confirmed.
              </p>
            </div>

            {/* Landlord Explanation Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Landlord Notes (Appears on Official Report)
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500 leading-relaxed"
                placeholder="Enter justification or instructions for contractor..."
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveOverride}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Landlord Triage'}</span>
              </button>
            </div>

            {/* Audit Trail Note */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500 flex items-start gap-2">
              <HelpCircle size={14} className="shrink-0 mt-0.5 text-slate-400" />
              <span>
                All overrides are cryptographically signed and tracked on the audit log to preserve
                fairness for tenant dispute review.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReviewPage;
