import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Camera,
  AlertOctagon,
  Wrench,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { propertyService } from '../../services/propertyService';
import { inspectionService } from '../../services/inspectionService';
import { disputeService } from '../../services/disputeService';
import { maintenanceService } from '../../services/maintenanceService';
import { auditService } from '../../services/auditService';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import { CardSkeleton, TableSkeleton } from '../../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: properties, loading: propLoading } = useFetch(
    () => propertyService.getProperties(),
    []
  );
  const { data: inspections, loading: inspLoading } = useFetch(
    () => inspectionService.getInspections(),
    []
  );
  const { data: disputes, loading: dispLoading } = useFetch(
    () => disputeService.getDisputes(),
    []
  );
  const { data: maintenance, loading: maintLoading } = useFetch(
    () => maintenanceService.getTickets(),
    []
  );
  const { data: auditLogs, loading: auditLoading } = useFetch(
    () => auditService.getLogs(),
    []
  );

  const activeInspections =
    inspections?.filter((i) => i.status === 'in_progress' || i.status === 'ai_reviewed') || [];
  const openDisputes = disputes?.filter((d) => d.status === 'open') || [];
  const openMaintenance = maintenance?.filter((m) => m.status === 'open') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Portfolio Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Welcome back, John
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is your rental portfolio health and damage triage overview for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} /> Add Property
          </button>
          <button
            type="button"
            onClick={() => navigate('/inspections/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Camera size={15} /> Start New Inspection
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {propLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Properties Managed"
              value={properties?.length || 0}
              subtitle="92% Portfolio Occupancy"
              icon={Building2}
              onClick={() => navigate('/properties')}
            />
            <StatCard
              title="Active Inspections"
              value={activeInspections.length}
              subtitle="1 Ready for AI Review"
              icon={Camera}
              trend={{ value: '2 this week', isPositive: true }}
              onClick={() => navigate('/inspections/insp_101/review')}
            />
            <StatCard
              title="Open Disputes"
              value={openDisputes.length}
              subtitle="Requires Landlord Response"
              icon={AlertOctagon}
              onClick={() => navigate('/disputes')}
            />
            <StatCard
              title="Open Maintenance"
              value={openMaintenance.length}
              subtitle="$400 Est. Damage Claims"
              icon={Wrench}
              onClick={() => navigate('/maintenance')}
            />
          </>
        )}
      </div>

      {/* Two Column Layout: Active Inspections + Disputes & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Inspections & Quick Review */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Camera size={18} className="text-blue-600" />
              Active Property Inspections
            </h2>
            <Link
              to="/inspections/new"
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              + Create Inspection
            </Link>
          </div>

          <div className="space-y-3">
            {inspections?.map((insp) => (
              <div
                key={insp.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {insp.propertyName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {insp.type === 'move_out' ? 'Move-Out AI Comp' : 'Move-In Baseline'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tenant: <strong>{insp.tenantName}</strong> • Date: {insp.scheduledDate}
                  </p>
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {insp.status === 'ai_reviewed' && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Sparkles size={13} /> AI Damage Analysis Ready (4 Findings)
                      </span>
                    )}
                    {insp.status === 'finalized' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Finalized & Signed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {insp.status === 'ai_reviewed' ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/inspections/${insp.id}/review`)}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Review Findings <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/reports/${insp.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      View Report <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Open Disputes & Recent Audit Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Disputes Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertOctagon size={16} className="text-amber-600" />
                Open Tenant Disputes
              </h2>
              <Link to="/disputes" className="text-xs text-blue-600 hover:underline font-semibold">
                View All ({openDisputes.length})
              </Link>
            </div>

            {openDisputes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No open disputes</p>
            ) : (
              openDisputes.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {d.propertyName}
                    </span>
                    <span className="font-bold text-red-600 font-mono">
                      ${d.assessedAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                    &ldquo;{d.tenantComment}&rdquo;
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">By {d.tenantName}</span>
                    <button
                      type="button"
                      onClick={() => navigate('/disputes')}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Triage Dispute →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Audit Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                Recent Audit Trail
              </h2>
              <Link
                to="/audit-logs"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Full Ledger
              </Link>
            </div>

            <div className="space-y-3">
              {auditLogs?.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-l-2 border-blue-500 pl-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
