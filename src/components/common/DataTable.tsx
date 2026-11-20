import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found',
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 px-4 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs', className)}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className={cn('py-3 px-4', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col, idx) => (
                <td key={idx} className={cn('py-3.5 px-4 text-slate-800 dark:text-slate-200', col.className)}>
                  {col.cell
                    ? col.cell(item)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
