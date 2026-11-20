import React from 'react';
import { Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfidenceBadgeProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  showWarningPrompt?: boolean;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showWarningPrompt = true,
  className,
}) => {
  // Normalize to 0 - 100
  const percentage = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
  const isLowConfidence = percentage < 70;

  return (
    <div className={cn('inline-flex flex-col items-start gap-1', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all',
          isLowConfidence
            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 animate-pulse'
            : percentage >= 85
            ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
            : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
        )}
        title={
          isLowConfidence
            ? `Low Confidence (${percentage}%): Manual landlord verification strongly recommended`
            : `AI Vision Match Confidence: ${percentage}%`
        }
      >
        {isLowConfidence ? (
          <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <Sparkles size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
        )}
        <span>AI Match: {percentage}%</span>
      </div>

      {isLowConfidence && showWarningPrompt && (
        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
          <HelpCircle size={12} className="shrink-0" />
          Low confidence (&lt;70%) — verify manually
        </span>
      )}
    </div>
  );
};

export default ConfidenceBadge;
