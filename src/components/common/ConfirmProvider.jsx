import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import Modal from './Modal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const confirm = options => new Promise(resolve => {
    resolver.current?.(false);
    resolver.current = resolve;
    setDialog(typeof options === 'string' ? { message: options } : options);
  });
  const finish = value => {
    const resolve = resolver.current;
    resolver.current = null;
    setDialog(null);
    resolve?.(value);
  };
  useEffect(() => () => resolver.current?.(false), []);
  return <ConfirmContext.Provider value={confirm}>
    {children}
    <Modal isOpen={!!dialog} onClose={() => finish(false)} title={dialog?.title || '작업 확인'} maxWidth="max-w-md">
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 whitespace-pre-line break-keep">{dialog?.message}</p>
      <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-200 dark:border-slate-800">
        <button onClick={() => finish(false)} className="commerce-button-secondary">취소</button>
        <button onClick={() => finish(true)} className="commerce-button">{dialog?.confirmLabel || '확인'}</button>
      </div>
    </Modal>
  </ConfirmContext.Provider>;
}

export const useConfirm = () => useContext(ConfirmContext);
