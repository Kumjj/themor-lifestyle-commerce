import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useShop();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />
  };

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="toast-region pointer-events-none fixed right-4 sm:right-6 z-[60] w-[calc(100%-2rem)] max-w-sm">
      {toast && <div className="flex items-start gap-3 px-5 py-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg text-slate-900 dark:text-slate-100">
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
      </div>}
    </div>
  );
}
