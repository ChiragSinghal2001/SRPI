import React, { useState } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Calendar,
  DollarSign,
  User,
  Home,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { DisputeAdmin } from '../../schemas/adminSchemas';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import DataTable, { Column } from '../../components/common/DataTable';
import { cn } from '../../utils/cn';

export const AdminDisputesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Detail view state
  const [selectedDispute, setSelectedDispute] = useState<DisputeAdmin | null>(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const {
    data: paginatedDisputes,
    loading,
    refetch,
  } = useFetch(
    () =>
      adminService.getDisputes({
        status: statusFilter,
        page,
        page_size: pageSize,
      }),
    [statusFilter, page]
  );

  const handleEscalateToggle = async (dispute: DisputeAdmin) => {
    try {
      const updated = await adminService.escalateDispute(dispute.id);
      dispatch(
        addToast({
          type: updated.is_escalated ? 'warning' : 'info',
          title: updated.is_escalated ? 'Dispute Escalated' : 'Escalation Cleared',
          message: `Dispute on ${dispute.property_name} marked as ${
            updated.is_escalated ? 'escalated for tribunal mediation' : 'normal oversight'
          }.`,
        })
      );
      if (selectedDispute?.id === dispute.id) {
        setSelectedDispute(updated);
      }
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Action Failed',
          message: 'Unable to update escalation flag.',
        })
      );
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const updated = await adminService.addDisputeNote(selectedDispute.id, newNote.trim());
      dispatch(
        addToast({
          type: 'success',
          title: 'Internal Note Recorded',
          message: 'Mediation note appended to dispute ledger.',
        })
      );
      setSelectedDispute(updated);
      setNewNote('');
      refetch();
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Note Failed',
          message: 'Unable to record internal note.',
        })
      );
    } finally {
      setSubmittingNote(false);
    }
  };

  const totalPages = Math.ceil((paginatedDisputes?.total || 0) / pageSize);

  const columns: Column<DisputeAdmin>[] = [
    {
      header: 'Property & Item',
      cell: (d) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
              d.is_escalated
                ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
                : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
            )}
          >
            <AlertOctagon size={16} />
          </div>
          <div className="min-w-0">
            <span
              onClick={() => setSelectedDispute(d)}
              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer block truncate"
            >
              {d.property_name}
            </span>
            <span className="text-xs text-slate-500 block truncate">
              {d.room} &bull; {d.object}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Disputed Amount',
      cell: (d) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          ${d.assessed_amount}
        </span>
      ),
    },
    {
      header: 'Parties',
      cell: (d) => (
        <div className="text-xs">
          <span className="text-slate-800 dark:text-slate-200 font-semibold block">
            Tenant: {d.tenant_name}
          </span>
          <span className="text-[11px] text-slate-500">Landlord: {d.landlord_name}</span>
        </div>
      ),
    },
    {
      header: 'Age',
      cell: (d) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold',
            d.age_days >= 7
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-600 dark:text-slate-400'
          )}
        >
          <Clock size={12} />
          <span>{d.age_days} days open</span>
        </span>
      ),
    },
    {
      header: 'Status & Escalation',
      cell: (d) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-semibold uppercase',
              d.status === 'open'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : d.status === 'accepted'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {d.status}
          </span>
          {d.is_escalated && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
              Escalated
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (d) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedDispute(d)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Inspect Dispute Dossier"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={() => handleEscalateToggle(d)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors',
              d.is_escalated
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
            )}
            title="Toggle dispute escalation status"
          >
            {d.is_escalated ? 'Escalated' : 'Escalate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Disputes Oversight &amp; Tribunal Mediation
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Neutral oversight and case timeline review. Adjudication decisions are strictly reserved for landlords and tenants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Total Cases: <strong className="text-slate-800 dark:text-white">{paginatedDisputes?.total || 0}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Filter Case Status
        </span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="py-1.5 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden"
        >
          <option value="all">All Disputes</option>
          <option value="open">Open Cases</option>
          <option value="accepted">Accepted Claims</option>
          <option value="rejected">Rejected Claims</option>
        </select>
      </div>

      {/* Disputes Table */}
      <DataTable
        columns={columns}
        data={paginatedDisputes?.items || []}
        keyExtractor={(d) => d.id}
        onRowClick={(d) => setSelectedDispute(d)}
        emptyMessage={loading ? 'Loading disputes...' : 'No disputes match your selected filter.'}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, paginatedDisputes?.total || 0)} of {paginatedDisputes?.total} disputes
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
      {/* DISPUTE DOSSIER DRAWER */}
      {/* ======================================================== */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    selectedDispute.is_escalated
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-white'
                  )}
                >
                  <AlertOctagon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedDispute.property_name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Dispute ID: {selectedDispute.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Notice of Admin Boundaries */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                <span className="font-bold block text-[11px] uppercase tracking-wider mb-0.5">
                  Admin Oversight Boundary
                </span>
                <p>
                  As an administrative oversight role, you can mark disputes as escalated and attach internal mediation notes. Accepting or rejecting security deposit deductions is solely the legal right of the landlord and tenant.
                </p>
              </div>

              {/* Escalation Toggle & Status */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Escalation Status: {selectedDispute.is_escalated ? 'Escalated' : 'Normal'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Case Age: {selectedDispute.age_days} days &bull; Assessed: ${selectedDispute.assessed_amount}
                  </span>
                </div>
                <button
                  onClick={() => handleEscalateToggle(selectedDispute)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                    selectedDispute.is_escalated
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  )}
                >
                  {selectedDispute.is_escalated ? 'Clear Escalation' : 'Escalate Dispute'}
                </button>
              </div>

              {/* Tenant Dispute Comment & Counter-Evidence */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Tenant Challenge Statement
                </h4>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Submitted by {selectedDispute.tenant_name}</span>
                    <span>{new Date(selectedDispute.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 italic">
                    "{selectedDispute.tenant_comment}"
                  </p>
                </div>
              </div>

              {/* Landlord Decision */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Landlord Decision &amp; Position
                </h4>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                  <span className="text-slate-500 text-[11px] block">
                    Assessed by {selectedDispute.landlord_name}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200">
                    {selectedDispute.landlord_decision ||
                      'Pending landlord review of tenant challenge statement.'}
                  </p>
                </div>
              </div>

              {/* Internal Admin Mediation Notes */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  <span>Internal Admin Oversight Notes ({selectedDispute.internal_notes.length})</span>
                </h4>

                <div className="space-y-2">
                  {selectedDispute.internal_notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <strong className="text-emerald-600 dark:text-emerald-400">{note.author}</strong>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{note.note}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddInternalNote} className="space-y-2 pt-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal observation, tribunal reference, or compliance note..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingNote || !newNote.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs disabled:opacity-50 transition-colors"
                    >
                      <Send size={12} />
                      <span>{submittingNote ? 'Saving...' : 'Append Note'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputesPage;
