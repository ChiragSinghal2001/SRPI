import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { auditService } from '../../services/auditService';
import { AuditEntry } from '../../types/audit';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { useAppSelector } from '../../hooks/useRedux';
import { propertyService } from '../../services/propertyService';

export const AuditLogPage: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { user } = useAppSelector((state) => state.auth);

  const { data: properties } = useFetch(
    () => propertyService.getProperties({ landlordId: user?.id }),
    [user?.id]
  );
  const propertyIds = properties?.map((p) => p.id) || [];

  const { data: logs, loading } = useFetch(
    () =>
      propertyIds.length > 0
        ? auditService
            .getLogs()
            .then((allLogs) =>
              allLogs.filter(
                (l) =>
                  l.actorId === user?.id ||
                  (l.propertyId && propertyIds.includes(l.propertyId)) ||
                  propertyIds.includes(l.resourceId)
              )
            )
        : Promise.resolve([]),
    [propertyIds.join(','), user?.id]
  );

  const filteredLogs = (logs || []).filter((log) => {
    const matchesRole = filterRole === 'ALL' || log.actorRole === filterRole;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <ShieldCheck size={15} /> Immutable Event Ledger
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            System & Inspection Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed timeline of all overrides, inspections, disputes, and report locks
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action or actor name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Filter by Actor:</span>
          {['ALL', 'LANDLORD', 'TENANT', 'SYSTEM'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${filterRole === role
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${log.actorRole === 'SYSTEM'
                          ? 'bg-emerald-500'
                          : log.actorRole === 'LANDLORD'
                            ? 'bg-emerald-500'
                            : 'bg-teal-500'
                          }`}
                      />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {log.actorName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({log.actorRole})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {log.resourceType}:{log.resourceId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
