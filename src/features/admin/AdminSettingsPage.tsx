import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  Cpu,
  UploadCloud,
  FileCheck2,
  Clock,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { SystemSettings, SystemSettingsSchema } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { cn } from '../../utils/cn';

export const AdminSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<SystemSettings | null>(null);

  const {
    data: initialSettings,
    loading,
    refetch,
  } = useFetch(() => adminService.getSettings(), []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors, isSubmitting },
  } = useForm<SystemSettings>({
    resolver: zodResolver(SystemSettingsSchema),
  });

  // Populate form once fetched
  useEffect(() => {
    if (initialSettings) {
      reset(initialSettings);
    }
  }, [initialSettings, reset]);

  // Unsaved changes browser prompt on tab close / navigate away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const onPreSubmit = (values: SystemSettings) => {
    setPendingValues(values);
    setSaveDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingValues) return;
    try {
      await adminService.updateSettings(pendingValues);
      dispatch(
        addToast({
          type: 'success',
          title: 'System Settings Saved',
          message: 'Changes saved and recorded in the audit log.',
        })
      );
      setSaveDialogOpen(false);
      reset(pendingValues);
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: 'Unable to update system settings.',
        })
      );
    }
  };

  if (loading && !initialSettings) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System &amp; Pipeline Configuration
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Global inference thresholds, image constraints, cryptographic ledger retention, and auto-dispatch rules.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            <AlertTriangle size={13} />
            <span>Unsaved Changes Detected</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onPreSubmit)} className="space-y-6">
        {/* Section 1: Siamese Neural Inference */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Cpu size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Siamese AI Comparison Parameters
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Confidence Threshold for Manual Review (Default: 70%)
                </label>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((watch('ai_confidence_threshold') || 0.7) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.01"
                {...register('ai_confidence_threshold', { valueAsNumber: true })}
                className="w-full accent-emerald-600"
              />
              <p className="text-slate-500 mt-1">
                Findings with a neural similarity confidence below this cutoff are flagged for mandatory human landlord sign-off.
              </p>
              {errors.ai_confidence_threshold && (
                <p className="text-red-500 mt-1">{errors.ai_confidence_threshold.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Upload Constraints & Storage */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <UploadCloud size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Evidence Upload Constraints
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Max Photo Upload Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                {...register('max_image_upload_size_mb', { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              {errors.max_image_upload_size_mb && (
                <p className="text-red-500 mt-1">{errors.max_image_upload_size_mb.message}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Temporary Signed Photo Link Expiry (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                {...register('photo_link_expiry_minutes', { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              {errors.photo_link_expiry_minutes && (
                <p className="text-red-500 mt-1">{errors.photo_link_expiry_minutes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Ledger Retention & Automation */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileCheck2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ledger Retention &amp; Automation
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Report &amp; Evidence Retention Period (Months)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                {...register('report_retention_months', { valueAsNumber: true })}
                className="w-full sm:w-1/2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
              <p className="text-slate-500 mt-1">
                Finalised tamper-evident reports remain immutable and verifiable against SHA-256 for this duration.
              </p>
              {errors.report_retention_months && (
                <p className="text-red-500 mt-1">{errors.report_retention_months.message}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Automatic Maintenance Ticket Generation
                </span>
                <p className="text-slate-500">
                  Automatically create maintenance dispatches for findings flagged as 'Damaged' upon move-out finalisation.
                </p>
              </div>
              <input
                type="checkbox"
                {...register('maintenance_auto_create')}
                className="w-5 h-5 rounded text-emerald-600 accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => initialSettings && reset(initialSettings)}
            disabled={!isDirty}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Discard Changes</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shadow-xs"
          >
            <Save size={15} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={saveDialogOpen}
        onCancel={() => setSaveDialogOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Configuration Update"
        message="Are you sure you want to apply these system settings? This will append an immutable audit entry recording the old and updated parameters."
        confirmLabel="Apply Changes"
        isDestructive={false}
      />
    </div>
  );
};

export default AdminSettingsPage;
