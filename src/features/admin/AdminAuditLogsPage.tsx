import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  Shield,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { AuditLogAdmin } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import DataTable, { Column } from '../../components/common/DataTable';
import { cn } from '../../utils/cn';

export const AdminAuditLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const {
    data: paginatedLogs,
    loading,
  } = useFetch(
    () =>
      adminService.getAuditLogs({
        action: actionFilter,
        resource_type: resourceFilter,
        user: search,
        page,
        page_size: pageSize,
      }),
    [search, actionFilter, resourceFilter, page]
  );

  const handleExportCSV = () => {
    const logsToExport = paginatedLogs?.items || [];
    if (logsToExport.length === 0) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'Export Empty',
          message: 'No audit records match the selected filter.',
        })
      );
      return;
    }

    // CSV header row
    const headers = ['ID', 'Timestamp', 'User', 'Email', 'Role', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Details'];
    const rows = logsToExport.map((log) => [
      log.id,
      `"${log.created_at}"`,
      `"${log.user_name}"`,
      `"${log.user_email}"`,
      log.role,
      log.action,
      log.resource_type,
      log.resource_id,
      log.ip_address,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `srpi_audit_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(
      addToast({
        type: 'success',
        title: 'CSV Export Generated',
        message: `Exported ${logsToExport.length} immutable audit records.`,
      })
    );
  };

  const totalPages = Math.ceil((paginatedLogs?.total || 0) / pageSize);

  const columns: Column<AuditLogAdmin>[] = [
    {
      header: 'Timestamp',
      cell: (l) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(l.created_at).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'Actor',
      cell: (l) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900 dark:text-white block">{l.user_name}</span>
          <span className="text-[11px] text-slate-500">{l.user_email}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (l) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
            l.role === 'admin'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : l.role === 'landlord'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : l.role === 'system'
              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          )}
        >
          {l.role}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (l) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          {l.action}
        </span>
      ),
    },
    {
      header: 'Resource',
      cell: (l) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {l.resource_type}: {l.resource_id.slice(0, 12)}...
        </span>
      ),
    },
    {
      header: 'Event Details',
      cell: (l) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-sm block">
          {l.details || 'System event recorded'}
        </span>
      ),
    },
    {
      header: 'IP Address',
      cell: (l) => <span className="text-[11px] font-mono text-slate-400">{l.ip_address}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Global Audit Log &amp; Security Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Append-only tamper-evident event stream capturing every admin intervention and platform change.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs transition-colors shrink-0"
        >
          <Download size={14} />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor name or email..."
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
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Actions</option>
            <option value="USER_">User Actions</option>
            <option value="REPORT_">Report Integrity</option>
            <option value="AI_">AI Operations</option>
            <option value="SETTINGS_">Settings Changes</option>
          </select>

          <select
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Resources</option>
            <option value="USER">User</option>
            <option value="PROPERTY">Property</option>
            <option value="INSPECTION_REPORT">Inspection Report</option>
            <option value="AI_JOB">AI Job</option>
            <option value="DISPUTE">Dispute</option>
            <option value="SYSTEM_SETTINGS">System Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Log DataTable */}
      <DataTable
        columns={columns}
        data={paginatedLogs?.items || []}
        keyExtractor={(l) => l.id}
        emptyMessage={loading ? 'Streaming audit ledger...' : 'No audit records match your query.'}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, paginatedLogs?.total || 0)} of {paginatedLogs?.total} records
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
    </div>
  );
};

export default AdminAuditLogsPage;
