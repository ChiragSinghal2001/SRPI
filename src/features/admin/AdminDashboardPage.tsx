import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  FileCheck2,
  AlertOctagon,
  Wrench,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  UserX,
  RotateCw,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import StatCard from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { cn } from '../../utils/cn';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  const {
    data: stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useFetch(() => adminService.getAdminStats(), []);

  const {
    data: recentLogs,
    loading: logsLoading,
    refetch: refetchLogs,
  } = useFetch(() => adminService.getAuditLogs({ page: 1, page_size: 6 }), []);

  const {
    data: failedJobs,
    loading: failedLoading,
    refetch: refetchFailedJobs,
  } = useFetch(() => adminService.getAiJobs({ status: 'failed', page_size: 5 }), []);

  const {
    data: disputesData,
    loading: disputesLoading,
    refetch: refetchDisputes,
  } = useFetch(() => adminService.getDisputes({ status: 'open', page_size: 10 }), []);

  const {
    data: suspendedUsers,
    loading: suspendedLoading,
    refetch: refetchSuspended,
  } = useFetch(() => adminService.getUsers({ status: 'suspended', page_size: 5 }), []);

  const {
    data: unverifiedProperties,
    loading: unverifiedLoading,
    refetch: refetchUnverified,
  } = useFetch(
    () => adminService.getProperties({ genuineness: 'pending_check', page_size: 5 }),
    []
  );

  const handleRefreshAll = () => {
    refetchStats();
    refetchLogs();
    refetchFailedJobs();
    refetchDisputes();
    refetchSuspended();
    refetchUnverified();
    dispatch(
      addToast({
        type: 'info',
        title: 'Dashboard Refreshed',
        message: 'Loaded latest telemetry, audit stream, and alert items.',
      })
    );
  };

  const handleRetryJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRetryingJobId(jobId);
      await adminService.retryAiJob(jobId);
      dispatch(
        addToast({
          type: 'success',
          title: 'AI Job Queued',
          message: `Job ${jobId} was resubmitted to the neural comparison queue.`,
        })
      );
      refetchFailedJobs();
      refetchStats();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Retry Failed',
          message: 'Unable to resubmit job at this time.',
        })
      );
    } finally {
      setRetryingJobId(null);
    }
  };

  // Filter disputes older than 7 days for the attention panel
  const staleDisputes = (disputesData?.items || []).filter((d) => d.age_days >= 7);

  if (statsLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const s = stats!;

  // Calculations for chart distributions
  const totalFindings =
    (s.findings_by_status.good || 0) +
    (s.findings_by_status.flagged || 0) +
    (s.findings_by_status.damaged || 0);

  const goodPct = totalFindings > 0 ? Math.round((s.findings_by_status.good / totalFindings) * 100) : 0;
  const flaggedPct = totalFindings > 0 ? Math.round((s.findings_by_status.flagged / totalFindings) * 100) : 0;
  const damagedPct = totalFindings > 0 ? 100 - goodPct - flaggedPct : 0;

  const totalJobs =
    (s.ai_jobs_by_status.completed || 0) +
    (s.ai_jobs_by_status.running || 0) +
    (s.ai_jobs_by_status.queued || 0) +
    (s.ai_jobs_by_status.failed || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              System Oversight &amp; Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time multi-tenant monitoring, Siamese AI job queues, tamper-evident report ledger, and dispute governance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefreshAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* 1. Core Platform Stat Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            PLATFORM PARTICIPATION &amp; WORKFLOW VOLUME
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Users"
            value={s.total_users}
            subtitle={`${s.landlords_count} Landlords • ${s.tenants_count} Tenants`}
            icon={Users}
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            title="Properties"
            value={s.properties_count}
            subtitle="Registered units"
            icon={Building2}
            onClick={() => navigate('/admin/properties')}
          />
          <StatCard
            title="Inspections"
            value={s.inspections_count}
            subtitle="Move-in & Move-out"
            icon={FileCheck2}
            onClick={() => navigate('/admin/reports')}
          />
          <StatCard
            title="Finalised Reports"
            value={s.finalised_reports_count}
            subtitle="SHA-256 tamper-evident"
            icon={FileCheck2}
            onClick={() => navigate('/admin/reports')}
          />
          <StatCard
            title="Open Disputes"
            value={s.open_disputes_count}
            subtitle={s.open_disputes_count > 0 ? 'Requires attention' : 'All resolved'}
            icon={AlertOctagon}
            onClick={() => navigate('/admin/disputes')}
          />
          <StatCard
            title="Maintenance"
            value={s.open_maintenance_count}
            subtitle="Auto-dispatched tickets"
            icon={Wrench}
          />
        </div>
      </section>

      {/* 2. Siamese AI Pipeline Health Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <Cpu size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>SIAMESE AI INFERENCE &amp; PIPELINE HEALTH</span>
          </h2>
          <button
            onClick={() => navigate('/admin/ai-jobs')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>AI Jobs Monitor</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Job Queues */}
          <div
            onClick={() => navigate('/admin/ai-jobs')}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <span>Jobs In Flight</span>
              <Cpu size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {s.ai_jobs_running + s.ai_jobs_queued}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {s.ai_jobs_running} running • {s.ai_jobs_queued} queued
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full font-medium',
                  s.ai_jobs_failed > 0
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                )}
              >
                {s.ai_jobs_failed} failed jobs
              </span>
            </div>
          </div>

          {/* Average Confidence */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <span>Avg Neural Confidence</span>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {Math.round(s.ai_average_confidence * 100)}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                High precision
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(s.ai_average_confidence * 100)}%` }}
              />
            </div>
          </div>

          {/* Low Confidence Rate (< 70% threshold) */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <span>Below 70% Threshold</span>
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {Math.round(s.low_confidence_rate * 100)}%
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Triage required
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Requires landlord visual sign-off before report lock
            </p>
          </div>

          {/* 7-Day Inference Failure Rate */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <span>7-Day Failure Rate</span>
              <ShieldAlert size={18} className="text-slate-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {Math.round(s.failure_rate_7d * 100)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Target: &lt; 5%</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Model version: v2.4.1 (ResNet50 Siamese)
            </p>
          </div>
        </div>
      </section>

      {/* 3. Telemetry Visual Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Inspection Trends */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Inspections Velocity
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Last 6 Months
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Number of verified move-in / move-out cycles executed
            </p>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
            {s.monthly_inspections.map((m, idx) => {
              const maxCount = Math.max(...s.monthly_inspections.map((x) => x.count), 1);
              const heightPct = Math.max(15, Math.round((m.count / maxCount) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-sm">
                    {m.count} inspections
                  </div>
                  {/* Bar */}
                  <div className="w-full max-w-[32px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-emerald-600 group-hover:bg-emerald-500 dark:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-all rounded-t-md"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-full">
                    {m.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: AI Findings Distribution */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Findings Distribution
              </h3>
              <span className="text-xs text-slate-400">{totalFindings} findings</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown of automated object comparisons
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Segmented Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              <div
                style={{ width: `${goodPct}%` }}
                className="bg-emerald-500 h-full"
                title={`Good: ${s.findings_by_status.good}`}
              />
              <div
                style={{ width: `${flaggedPct}%` }}
                className="bg-amber-500 h-full"
                title={`Flagged: ${s.findings_by_status.flagged}`}
              />
              <div
                style={{ width: `${damagedPct}%` }}
                className="bg-red-500 h-full"
                title={`Damaged: ${s.findings_by_status.damaged}`}
              />
            </div>

            {/* Legend with Counts */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block">
                  Good / Clean
                </span>
                <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {s.findings_by_status.good}
                </span>
                <span className="text-[10px] text-slate-500 block">{goodPct}%</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20">
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">
                  Flagged Scuffs
                </span>
                <span className="text-lg font-bold text-amber-800 dark:text-amber-300">
                  {s.findings_by_status.flagged}
                </span>
                <span className="text-[10px] text-slate-500 block">{flaggedPct}%</span>
              </div>
              <div className="p-2 rounded-lg bg-red-50/60 dark:bg-red-950/20">
                <span className="text-xs text-red-700 dark:text-red-400 font-semibold block">
                  Damaged
                </span>
                <span className="text-lg font-bold text-red-800 dark:text-red-300">
                  {s.findings_by_status.damaged}
                </span>
                <span className="text-[10px] text-slate-500 block">{damagedPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: AI Inference Pipeline Status */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Jobs Breakdown
              </h3>
              <span className="text-xs text-slate-400">{totalJobs} total jobs</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Current state of batch analysis queues
            </p>
          </div>

          <div className="space-y-3 my-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed Analysis
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {s.ai_jobs_by_status.completed}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${totalJobs ? (s.ai_jobs_by_status.completed / totalJobs) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Active In-Flight
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {s.ai_jobs_by_status.running + s.ai_jobs_by_status.queued}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${
                    totalJobs ? ((s.ai_jobs_by_status.running + s.ai_jobs_by_status.queued) / totalJobs) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Failed / Retryable
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {s.ai_jobs_by_status.failed}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full"
                style={{ width: `${totalJobs ? (s.ai_jobs_by_status.failed / totalJobs) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Split Grid: Needs Attention vs Recent Audit Stream */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention Card */}
        <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Needs Immediate Attention
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {(failedJobs?.items.length || 0) +
                  staleDisputes.length +
                  (suspendedUsers?.items.length || 0) +
                  (unverifiedProperties?.items.length || 0)}{' '}
                issues
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Prioritized operational alerts requiring administrator intervention or notification.
            </p>

            <div className="space-y-3">
              {/* Properties Pending Deed Verification */}
              {unverifiedProperties && unverifiedProperties.items.length > 0 && (
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      <span>Properties Pending Verification ({unverifiedProperties.items.length})</span>
                    </span>
                    <button
                      onClick={() => navigate('/admin/properties')}
                      className="text-[11px] underline hover:text-emerald-800"
                    >
                      View All
                    </button>
                  </div>
                  {unverifiedProperties.items.slice(0, 3).map((prop) => (
                    <div
                      key={prop.id}
                      className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {prop.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Landlord: {prop.landlord_name} &bull; ${prop.monthly_rent}/mo &bull; Hidden from tenants
                        </p>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await adminService.verifyPropertyGenuineness(prop.id, 'verified');
                          dispatch(
                            addToast({
                              type: 'success',
                              title: 'Property Deed Verified',
                              message: `${prop.name} is now approved and visible to prospective tenants!`,
                            })
                          );
                          refetchUnverified();
                          refetchStats();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-xs transition-colors"
                      >
                        <ShieldCheck size={11} />
                        <span>Verify Deed</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Failed AI Jobs */}
              {failedJobs && failedJobs.items.length > 0 && (
                <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-700 dark:text-red-400">
                    <span className="flex items-center gap-1.5">
                      <Cpu size={14} />
                      <span>Failed AI Comparison Jobs ({failedJobs.items.length})</span>
                    </span>
                    <button
                      onClick={() => navigate('/admin/ai-jobs')}
                      className="text-[11px] underline hover:text-red-800"
                    >
                      View All
                    </button>
                  </div>
                  {failedJobs.items.slice(0, 2).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {job.property_name}
                        </p>
                        <p className="text-[10px] text-red-600 dark:text-red-400 truncate">
                          {job.error_message || 'Inference error'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleRetryJob(job.id, e)}
                        disabled={retryingJobId === job.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 shrink-0"
                      >
                        <RotateCw size={11} className={cn(retryingJobId === job.id && 'animate-spin')} />
                        <span>{retryingJobId === job.id ? 'Retrying...' : 'Retry'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Stale Disputes (> 7 Days) */}
              {staleDisputes.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Stale Open Disputes &gt; 7 Days ({staleDisputes.length})</span>
                    </span>
                    <button
                      onClick={() => navigate('/admin/disputes')}
                      className="text-[11px] underline hover:text-amber-800"
                    >
                      View All
                    </button>
                  </div>
                  {staleDisputes.slice(0, 2).map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded px-1"
                      onClick={() => navigate('/admin/disputes')}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {d.property_name} &bull; {d.room} ({d.object})
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Tenant: {d.tenant_name} &bull; Age: {d.age_days} days
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        ${d.assessed_amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suspended Users */}
              {suspendedUsers && suspendedUsers.items.length > 0 && (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <UserX size={14} className="text-red-500" />
                      <span>Suspended Accounts ({suspendedUsers.items.length})</span>
                    </span>
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="text-[11px] underline hover:text-emerald-600"
                    >
                      Manage
                    </button>
                  </div>
                  {suspendedUsers.items.slice(0, 2).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {u.name} ({u.role})
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Reason: {u.suspension_reason || 'Compliance flag'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        className="px-2 py-0.5 rounded text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(!failedJobs || failedJobs.items.length === 0) &&
                staleDisputes.length === 0 &&
                (!suspendedUsers || suspendedUsers.items.length === 0) &&
                (!unverifiedProperties || unverifiedProperties.items.length === 0) && (
                  <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    All queues clear. No critical alerts or suspended accounts at this time.
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Recent Audit Log Stream Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Audit Stream &amp; Ledger
              </h3>
              <button
                onClick={() => navigate('/admin/audit-logs')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Audit Log</span>
                <ArrowRight size={12} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cryptographic chain of admin oversight actions, integrity checks, and user modifications.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(recentLogs?.items || []).map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {log.action}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        by <strong className="text-slate-700 dark:text-slate-300">{log.user_name}</strong>
                      </span>
                    </div>
                    {log.details && (
                      <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs truncate">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap pt-0.5">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
