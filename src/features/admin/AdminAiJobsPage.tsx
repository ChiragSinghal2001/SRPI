import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  X,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { usePolling } from '../../hooks/usePolling';
import { adminService, PaginatedResult } from '../../services/adminService';
import { AiJobAdmin } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import { cn } from '../../utils/cn';

interface AiJobsPollingResult extends PaginatedResult<AiJobAdmin> {
  status: string;
  [key: string]: unknown;
}

export const AdminAiJobsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Selected job for per-image results drawer
  const [selectedJob, setSelectedJob] = useState<AiJobAdmin | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Auto-refresh via usePolling while any job is queued or running
  const {
    data: pollingResult,
    loading,
    isPolling,
    refetchNow,
    startPolling,
  } = usePolling<AiJobsPollingResult>(
    async () => {
      const res = await adminService.getAiJobs({ status: statusFilter, page, page_size: pageSize });
      const hasActiveJobs = res.items.some(
        (j) => j.status === 'queued' || j.status === 'running'
      );
      return {
        ...res,
        status: hasActiveJobs ? 'processing' : 'completed',
      };
    },
    {
      intervalMs: 3500,
      enabled: true,
      stopCondition: (res) => res.status === 'completed',
    }
  );

  // Resume polling when filter or page changes
  useEffect(() => {
    startPolling();
  }, [statusFilter, page, startPolling]);

  const handleRetry = async (job: AiJobAdmin, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setRetryingId(job.id);
      await adminService.retryAiJob(job.id);
      dispatch(
        addToast({
          type: 'success',
          title: 'Job Resubmitted',
          message: `Job ${job.id} re-queued into Siamese neural pipeline.`,
        })
      );
      startPolling();
      refetchNow();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Retry Failed',
          message: 'Unable to restart inference job.',
        })
      );
    } finally {
      setRetryingId(null);
    }
  };

  const totalPages = Math.ceil((pollingResult?.total || 0) / pageSize);

  const columns: Column<AiJobAdmin>[] = [
    {
      header: 'Session & Property',
      cell: (j) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Cpu size={16} />
          </div>
          <div className="min-w-0">
            <span
              onClick={() => setSelectedJob(j)}
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {j.property_name}
            </span>
            <span className="text-xs text-slate-500 font-mono block">
              {j.id} &bull; Session: {j.session_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status & Progress',
      cell: (j) => {
        const isQueued = j.status === 'queued';
        const isRunning = j.status === 'running';
        const isCompleted = j.status === 'completed';
        const isFailed = j.status === 'failed';

        return (
          <div className="space-y-1.5 w-36">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : isRunning
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : isQueued
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              )}
            >
              {isRunning ? (
                <RotateCw size={11} className="animate-spin text-blue-600" />
              ) : isCompleted ? (
                <CheckCircle2 size={11} className="text-emerald-600" />
              ) : isQueued ? (
                <Clock size={11} className="text-slate-500" />
              ) : (
                <XCircle size={11} className="text-red-600" />
              )}
              <span>{j.status}</span>
            </span>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-blue-500'
                )}
                style={{ width: `${j.progress}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Started',
      cell: (j) => (
        <span className="text-xs text-slate-500">
          {new Date(j.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Duration',
      cell: (j) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {j.duration_seconds ? `${j.duration_seconds}s` : 'Running...'}
        </span>
      ),
    },
    {
      header: 'Diagnostics / Findings',
      cell: (j) => {
        if (j.error_message) {
          return (
            <span className="text-xs text-red-600 dark:text-red-400 font-medium truncate block max-w-xs">
              {j.error_message}
            </span>
          );
        }
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {j.findings.length} findings analyzed
            {j.average_confidence
              ? ` &bull; ${Math.round(j.average_confidence * 100)}% avg`
              : ''}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (j) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedJob(j)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Inspect Per-Image Findings"
          >
            <Eye size={15} />
          </button>

          {j.status === 'failed' && (
            <button
              onClick={(e) => handleRetry(j, e)}
              disabled={retryingId === j.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 transition-colors"
              title="Resubmit job to neural comparison queue"
            >
              <RotateCw size={12} className={cn(retryingId === j.id && 'animate-spin')} />
              <span>Retry</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title with Live Polling Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Jobs &amp; Siamese Neural Pipeline Monitor
            </h1>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                isPolling
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', isPolling ? 'bg-blue-500' : 'bg-slate-400')} />
              <span>{isPolling ? 'POLLING ACTIVE (3.5s)' : 'IDLE'}</span>
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time visual comparison inference queue tracking, failure retry engine, and neural metrics.
          </p>
        </div>

        <button
          onClick={() => {
            startPolling();
            refetchNow();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <RefreshCw size={14} />
          <span>Poll Now</span>
        </button>
      </div>

      {/* Model Version & Telemetry Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold mb-1">
            <span>Model Version</span>
            <Sparkles size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">v2.4.1</p>
          <span className="text-[11px] text-slate-500">ResNet50 Siamese + Cosine Distance</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold mb-1">
            <span>Average Confidence</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">84.2%</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Across 142 pair comparisons
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold mb-1">
            <span>Low Confidence Rate</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">14.1%</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            Findings flagged &lt; 70% threshold
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold mb-1">
            <span>7-Day Failure Rate</span>
            <ShieldAlert size={16} className="text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">2.5%</p>
          <span className="text-[11px] text-slate-500">Healthy (under 5% SLA threshold)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Inference Pipeline Status
        </span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="py-1.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* AI Jobs DataTable */}
      <DataTable
        columns={columns}
        data={pollingResult?.items || []}
        keyExtractor={(j) => j.id}
        onRowClick={(j) => setSelectedJob(j)}
        emptyMessage={loading ? 'Polling inference queue...' : 'No AI jobs found matching status.'}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, pollingResult?.total || 0)} of {pollingResult?.total} AI jobs
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
      {/* JOB DETAIL DRAWER (Per-Image Findings & Confidence) */}
      {/* ======================================================== */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedJob.property_name} &bull; Neural Run
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Job ID: {selectedJob.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Job Status Banner */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Execution State
                  </span>
                  <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {selectedJob.status} ({selectedJob.progress}%)
                  </span>
                </div>

                {selectedJob.error_message && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                    <strong className="block font-bold">Error Output:</strong>
                    <span>{selectedJob.error_message}</span>
                    <div className="mt-2">
                      <button
                        onClick={() => handleRetry(selectedJob)}
                        className="px-3 py-1 rounded bg-red-600 text-white font-semibold text-xs"
                      >
                        Resubmit Job Now
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Per-Image Findings List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                    Per-Image Visual Inferences ({selectedJob.findings.length})
                  </h4>
                  {selectedJob.average_confidence && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Avg Score: {Math.round(selectedJob.average_confidence * 100)}%
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  {selectedJob.findings.map((f, idx) => (
                    <div key={idx} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {f.room} &bull; {f.object}
                          </span>
                          <StatusChip status={f.status} size="sm" />
                        </div>
                        <span
                          className={cn(
                            'font-mono text-xs font-bold px-2 py-0.5 rounded',
                            f.confidence >= 0.7
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          )}
                        >
                          {Math.round(f.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-slate-500">{f.description}</p>
                      {f.confidence < 0.7 && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          ⚠ Below 70% confidence threshold — flagged for landlord visual triage.
                        </p>
                      )}
                    </div>
                  ))}

                  {selectedJob.findings.length === 0 && (
                    <div className="text-center py-6 text-slate-500">
                      No findings emitted yet. Job is currently queued or in process.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiJobsPage;
