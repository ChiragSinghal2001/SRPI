import React from 'react';
import { cn } from '../../utils/cn';

export interface AppLogoProps {
  /** Size in pixels (number) or preset keyword */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imgClassName?: string;
  /** Whether to show the text alongside the logo */
  showText?: boolean;
  /** Custom portal subtitle (e.g. "Landlord Portal", "Tenant Portal", "Admin Portal") */
  subtitle?: string;
  /** Variant of the text (e.g. "Admin", "Inspector") */
  textAccent?: string;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className,
  imgClassName,
  showText = false,
  subtitle,
  textAccent = 'Inspector',
}) => {
  const isNumeric = typeof size === 'number';
  const sizeClass = !isNumeric ? sizeMap[size] : undefined;
  const inlineStyle = isNumeric ? { width: size, height: size } : undefined;

  const logoMark = (
    <div
      style={inlineStyle}
      className={cn(
        'relative rounded-xl overflow-hidden bg-[#0a2140] flex items-center justify-center shrink-0 shadow-md border border-emerald-500/30 group-hover:border-emerald-500/60 transition-all select-none',
        sizeClass,
        className
      )}
    >
      <img
        src="/logo.png"
        alt="Smart Rental Property Inspector Logo"
        className={cn('w-full h-full object-cover', imgClassName)}
        loading="eager"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo.svg';
        }}
      />
    </div>
  );

  if (!showText) {
    return logoMark;
  }

  return (
    <div className="flex items-center gap-2.5">
      {logoMark}
      <div className="flex flex-col text-left">
        <span className="leading-tight text-slate-900 dark:text-white font-extrabold text-base tracking-tight">
          Smart<span className="text-emerald-600 dark:text-emerald-400">{textAccent}</span>
        </span>
        {subtitle && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default AppLogo;
