import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { removeToast } from '../../store/slices/uiSlice';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((t) =>
      setTimeout(() => {
        dispatch(removeToast(t.id));
      }, t.duration || 4500)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const borderStyles = {
    success: 'border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
    error: 'border-red-300 dark:border-red-800 text-red-950 dark:text-red-100',
    warning: 'border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100',
    info: 'border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
  };

  const iconStyles = {
    success: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-xl transition-all animate-in slide-in-from-bottom-5',
              borderStyles[toast.type]
            )}
          >
            <Icon size={20} className={cn('shrink-0 mt-0.5', iconStyles[toast.type])} />

            <div className="flex-1 text-xs sm:text-sm">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-0.5 text-slate-600 dark:text-slate-400 text-xs">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => dispatch(removeToast(toast.id))}
              aria-label="Dismiss toast"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
