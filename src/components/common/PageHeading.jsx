import React from 'react';

export default function PageHeading({ title, description, children }) {
  return (
    <header className="page-heading">
      <div className="min-w-0">
        <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">THEMOR <span className="mx-2" aria-hidden="true">/</span> {title}</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400 break-keep">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
}
