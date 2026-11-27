import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Hash,
  AlertTriangle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { InspectionReportAdmin } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import DataTable, { Column } from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import { cn } from '../../utils/cn';

export const AdminReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [integrityFilter, setIntegrityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Verification state tracking per report ID
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<
    Record<string, { is_valid: boolean; computed_hash: string; stored_hash: string }>
  >({});

  // Read-only report preview modal
  const [selectedReport, setSelectedReport] = useState<InspectionReportAdmin | null>(null);

  const {
    data: paginatedReports,
    loading,
    refetch,
  } = useFetch(
    () =>
      adminService.getReports({
        search,
        type: typeFilter,
        integrity: integrityFilter,
        page,
        page_size: pageSize,
      }),
    [search, typeFilter, integrityFilter, page]
  );

  const handleVerifyIntegrity = async (report: InspectionReportAdmin, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setVerifyingId(report.id);
      const res = await adminService.verifyReport(report.id);
      setVerificationResults((prev) => ({ ...prev, [report.id]: res }));

      if (res.is_valid) {
        dispatch(
          addToast({
            type: 'success',
            title: 'SHA-256 Integrity Verified',
            message: `Report ${report.id} cryptographically matches tamper ledger.`,
          })
        );
      } else {
        dispatch(
          addToast({
            type: 'error',
            title: 'Tamper Detected! Hash Mismatch',
            message: `Report ${report.id} stored hash differs from expected computed SHA-256 hash!`,
          })
        );
      }
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Verification Failed',
          message: 'Unable to compute SHA-256 hash.',
        })
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const totalPages = Math.ceil((paginatedReports?.total || 0) / pageSize);

  const columns: Column<InspectionReportAdmin>[] = [
    {
      header: 'Report & Property',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <FileCheck2 size={16} />
          </div>
          <div className="min-w-0">
            <span
              onClick={() => setSelectedReport(r)}
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {r.property_name}
            </span>
            <span className="text-xs text-slate-500 font-mono block">
              {r.id} &bull; Inspector: {r.inspector_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Inspection Type',
      cell: (r) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
            r.type === 'move_out'
              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
          )}
        >
          {r.type.replace('_', '-')}
        </span>
      ),
    },
    {
      header: 'Finalised Date',
      cell: (r) => (
        <span className="text-xs text-slate-500">
          {r.finalised_date ? new Date(r.finalised_date).toLocaleDateString() : 'Pending finalisation'}
        </span>
      ),
    },
    {
      header: 'Lock State',
      cell: (r) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none',
            r.is_locked
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          )}
        >
          {r.is_locked ? <Lock size={12} className="text-emerald-600" /> : <Unlock size={12} />}
          <span>{r.is_locked ? 'SHA-256 Locked' : 'Open Draft'}</span>
        </span>
      ),
    },
    {
      header: 'Integrity Verification',
      cell: (r) => {
        const liveResult = verificationResults[r.id];
        const status = liveResult
          ? liveResult.is_valid
            ? 'verified'
            : 'tampered'
          : r.integrity_status;

        if (status === 'verified') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 select-none">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>[✓ Verified SHA-256]</span>
            </span>
          );
        }

        if (status === 'tampered' || status === 'tampered_mismatch') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 select-none">
              <ShieldAlert size={14} className="text-red-600 dark:text-red-400" />
              <span>[⚠ Hash Mismatch - Tamper Detected]</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-500 font-medium select-none">
            <Hash size={12} />
            <span>Unchecked</span>
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r) => {
        const isVerifying = verifyingId === r.id;
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedReport(r)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Inspect Report Findings (Read-Only)"
            >
              <Eye size={15} />
            </button>

            <button
              onClick={(e) => handleVerifyIntegrity(r, e)}
              disabled={isVerifying}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 disabled:opacity-50 transition-colors"
              title="Recompute and compare SHA-256 hash"
            >
              <RotateCw size={12} className={cn(isVerifying && 'animate-spin')} />
              <span>{isVerifying ? 'Verifying...' : 'Verify Integrity'}</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Inspections &amp; Cryptographic Reports Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Read-only oversight of finalized move-in/out records with SHA-256 tamper-evident verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Total Ledgers: <strong className="text-slate-800 dark:text-white">{paginatedReports?.total || 0}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by property name, report ID, or hash..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Inspection Types</option>
            <option value="move_in">Move-In Baselines</option>
            <option value="move_out">Move-Out Inspections</option>
          </select>

          <select
            value={integrityFilter}
            onChange={(e) => {
              setIntegrityFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Integrity Statuses</option>
            <option value="verified">Verified SHA-256</option>
            <option value="tampered">Tamper Mismatches</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <DataTable
        columns={columns}
        data={paginatedReports?.items || []}
        keyExtractor={(r) => r.id}
        onRowClick={(r) => setSelectedReport(r)}
        emptyMessage={loading ? 'Loading inspection ledgers...' : 'No inspection reports match your filter.'}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, paginatedReports?.total || 0)} of {paginatedReports?.total} reports
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
      {/* READ-ONLY REPORT PREVIEW MODAL */}
      {/* ======================================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedReport.property_name} &bull; Condition Report Preview
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Ledger ID: {selectedReport.id} (READ-ONLY OVERSIGHT)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Tamper Seal Information */}
              <div
                className={cn(
                  'p-4 rounded-xl border flex items-start gap-3',
                  selectedReport.integrity_status === 'verified'
                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                    : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                )}
              >
                {selectedReport.integrity_status === 'verified' ? (
                  <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                    Cryptographic SHA-256 Ledger Seal
                  </span>
                  <p className="font-mono text-[10px] text-slate-500 break-all mt-1">
                    Stored Hash: {selectedReport.report_hash}
                  </p>
                  {selectedReport.expected_hash !== selectedReport.report_hash && (
                    <p className="font-mono text-[10px] text-red-600 font-bold break-all mt-0.5">
                      Expected Hash: {selectedReport.expected_hash} (TAMPER MISMATCH)
                    </p>
                  )}
                </div>
              </div>

              {/* Stakeholder Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                  <span className="text-slate-400 block text-[10px]">Inspector</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedReport.inspector_name}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                  <span className="text-slate-400 block text-[10px]">Unit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedReport.property_unit || 'Entire Unit'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                  <span className="text-slate-400 block text-[10px]">Lock State</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedReport.is_locked ? 'Locked (Final)' : 'Draft'}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                  <span className="text-slate-400 block text-[10px]">Deductions Total</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ${selectedReport.deductions_total || 0}
                  </span>
                </div>
              </div>

              {/* Findings Summary */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Findings Overview &amp; Cryptographic Evidence
                </h4>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedReport.findings_count} Items Evaluated
                    </span>
                    <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Ledger Verified
                    </span>
                  </div>
                  <p className="text-slate-500">
                    High-resolution move-in and move-out bilateral image pairs are cryptographically bound to report hash {selectedReport.report_hash.slice(0, 16)}...
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px]">
                Report content is strictly immutable. Finalised reports are cryptographically sealed. Editing actions are disabled for administrators.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
