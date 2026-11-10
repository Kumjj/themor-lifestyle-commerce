import React from 'react';

export function StatusBadge({ status }) {
  const configs = {
    received: { 
      label: '접수 완료', 
      className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
    },
    reviewing: { 
      label: '검토 중', 
      className: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' 
    },
    approved: { 
      label: '승인 완료', 
      className: 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white' 
    },
    rejected: { 
      label: '반려', 
      className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900' 
    }
  };

  const config = configs[status] || { 
    label: status, 
    className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' 
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ProductBadge({ text }) {
  // 하이엔드 상용 웹사이트의 미니멀 사각 마이크로 라벨 (네온/알약 배제)
  const isHighlight = text === 'BEST' || text === 'NEW' || text === '품절임박';

  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase select-none ${
      isHighlight
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
    }`}>
      {text}
    </span>
  );
}
