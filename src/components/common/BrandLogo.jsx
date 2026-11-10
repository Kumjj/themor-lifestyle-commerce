import React from 'react';

export default function BrandLogo({ size = 'md', className = '' }) {
  // Sizes: sm, md, lg
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl'
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Sharp Solid Minimalist Geometric Logo Icon */}
      <div className={`${iconSizes[size]} bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-sm flex items-center justify-center shadow-xs transition-colors p-1.5 shrink-0`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Architectural sharp angular 'T' modular emblem */}
          <rect x="4" y="5" width="24" height="6" fill="currentColor" />
          <rect x="13" y="11" width="6" height="16" fill="currentColor" />
          <polygon points="19,11 25,11 19,17" fill="currentColor" opacity="0.4" />
          <polygon points="7,11 13,11 13,17" fill="currentColor" opacity="0.4" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col text-left">
        <span className={`${textSizes[size]} font-black tracking-tight text-slate-950 dark:text-white leading-none`}>
          THEMOR
        </span>
        <span className={`${subSizes[size]} font-bold tracking-[0.22em] text-slate-400 dark:text-slate-400 uppercase mt-0.5 leading-none`}>
          MORE THAN SHOPPING
        </span>
      </div>
    </div>
  );
}
