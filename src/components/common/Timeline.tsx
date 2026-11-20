import React from 'react';
import { LucideIcon, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'default';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800', className)}>
      {events.map((event) => {
        const Icon = event.icon || Clock;

        return (
          <div key={event.id} className="relative group">
            {/* Timeline Dot / Icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon size={11} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {event.title}
                </span>
                {event.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {event.badge}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {new Date(event.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {event.description && (
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
