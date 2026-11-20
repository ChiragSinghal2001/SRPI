import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { ConditionStatus } from '../../types/inspection';
import { cn } from '../../utils/cn';

interface StatusChipProps {
  status: ConditionStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'md',
  className,
}) => {
  const configs = {
    good: {
      text: label || 'Good',
      icon: CheckCircle2,
      styles:
        'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    flagged: {
      text: label || 'Flagged',
      icon: AlertTriangle,
      styles:
        'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      iconClass: 'text-amber-600 dark:text-amber-400',
    },
    damaged: {
      text: label || 'Damaged',
      icon: XCircle,
      styles:
        'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
      iconClass: 'text-red-600 dark:text-red-400',
    },
    pending: {
      text: label || 'Pending',
      icon: Clock,
      styles:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      iconClass: 'text-slate-500 dark:text-slate-400',
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm sm:text-base px-3 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 18,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium select-none shadow-xs transition-colors',
        sizeClasses[size],
        config.styles,
        className
      )}
      role="status"
      aria-label={`Status: ${config.text}`}
    >
      <Icon size={iconSizes[size]} className={cn('shrink-0', config.iconClass)} aria-hidden="true" />
      <span>{config.text}</span>
    </span>
  );
};

export default StatusChip;
