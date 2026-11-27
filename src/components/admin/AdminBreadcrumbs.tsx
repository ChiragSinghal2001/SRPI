import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';

const segmentLabels: Record<string, string> = {
  admin: 'Admin Oversight',
  dashboard: 'Dashboard',
  users: 'User Management',
  properties: 'Properties Overview',
  reports: 'Reports & Integrity Ledger',
  'ai-jobs': 'AI Jobs Monitor',
  disputes: 'Disputes Oversight',
  'audit-logs': 'Global Audit Log',
  settings: 'System Settings',
  profile: 'Admin Profile',
};

export const AdminBreadcrumbs: React.FC<{ className?: string }> = ({ className }) => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400', className)}>
        <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">Admin Portal</span>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-slate-600 dark:text-slate-400">Dashboard</span>
      </div>
    );
  }

  let accumulatedPath = '';

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-xs select-none', className)}>
      <Link
        to="/admin/dashboard"
        className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
      >
        <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
        <span className="font-medium">Admin</span>
      </Link>

      {segments.map((seg, idx) => {
        accumulatedPath += `/${seg}`;
        if (seg === 'admin') return null;

        const isLast = idx === segments.length - 1;
        const label = segmentLabels[seg] || (seg.startsWith('usr_') ? `User ${seg.slice(0, 8)}...` : seg);

        return (
          <React.Fragment key={accumulatedPath}>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                to={accumulatedPath}
                className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default AdminBreadcrumbs;
