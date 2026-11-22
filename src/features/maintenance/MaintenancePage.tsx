import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  User,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { maintenanceService } from '../../services/maintenanceService';
import { MaintenanceTicket, MaintenanceStatus } from '../../types/maintenance';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const MaintenancePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { data: tickets, loading, refetch } = useFetch(
    () => maintenanceService.getTickets(),
    []
  );

  const handleStatusChange = async (id: string, newStatus: MaintenanceStatus) => {
    try {
      await maintenanceService.updateTicketStatus(id, newStatus);
      await refetch();
      dispatch(
        addToast({
          type: 'success',
          title: 'Ticket Updated',
          message: `Moved to ${newStatus.replace('_', ' ').toUpperCase()}`,
        })
      );
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to update ticket status',
        })
      );
    }
  };

  const columns: { status: MaintenanceStatus; title: string; color: string }[] = [
    { status: 'open', title: 'Open / Triage', color: 'border-amber-400 bg-amber-500/10' },
    { status: 'in_progress', title: 'In Progress', color: 'border-teal-400 bg-teal-500/10' },
    { status: 'done', title: 'Completed', color: 'border-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Maintenance & Repairs Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-created work orders from confirmed move-out damage items
          </p>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTickets = tickets?.filter((t) => t.status === col.status) || [];

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full shadow-2xs">
                    {colTickets.length}
                  </span>
                </div>

                {/* Tickets list */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTickets.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              {ticket.propertyName}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${ticket.severity === 'major'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                            >
                              {ticket.severity}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {ticket.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>

                        {ticket.assignedVendor && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <User size={13} className="text-slate-400" />
                            <span>{ticket.assignedVendor}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            Est: ${ticket.estimatedCost}
                          </span>

                          {/* Quick lane transition buttons */}
                          <div className="flex items-center gap-1">
                            {col.status !== 'open' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    ticket.id,
                                    col.status === 'done' ? 'in_progress' : 'open'
                                  )
                                }
                                className="p-1 rounded text-slate-400 hover:text-slate-700"
                                title="Move Back"
                              >
                                &larr;
                              </button>
                            )}

                            {col.status !== 'done' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    ticket.id,
                                    col.status === 'open' ? 'in_progress' : 'done'
                                  )
                                }
                                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold hover:bg-emerald-600 hover:text-white transition-colors"
                              >
                                {col.status === 'open' ? 'Start Work →' : 'Complete ✓'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
