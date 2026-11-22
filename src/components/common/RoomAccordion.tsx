import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RoomAccordionProps {
  roomName: string;
  totalRequired?: number;
  completedCount?: number;
  isCurrent?: boolean;
  isOpenDefault?: boolean;
  children: React.ReactNode;
  onSelectRoom?: () => void;
}

export const RoomAccordion: React.FC<RoomAccordionProps> = ({
  roomName,
  totalRequired = 4,
  completedCount = 0,
  isCurrent = false,
  isOpenDefault = true,
  children,
  onSelectRoom,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(isOpenDefault);
  const isComplete = completedCount >= totalRequired;

  return (
    <div
      className={cn(
        'rounded-xl border transition-all overflow-hidden mb-3',
        isCurrent
          ? 'border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-900 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          onSelectRoom?.();
        }}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left select-none hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
              isComplete
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
            )}
          >
            {isComplete ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {roomName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedCount} of {totalRequired} photos documented
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full border',
              isComplete
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            )}
          >
            {isComplete ? 'Complete' : `${totalRequired - completedCount} missing`}
          </span>
          {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800/80">{children}</div>}
    </div>
  );
};

export default RoomAccordion;
