import React, { useState } from 'react';
import { databaseService } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { useConfirm } from '../common/ConfirmProvider';

export default function LegacyDataImport() {
  const { showToast } = useShop();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [snapshot] = useState(() => {
    const data = {};
    for (const key of ['products', 'orders', 'requests', 'banners', 'notices']) {
      try { const value = JSON.parse(localStorage.getItem(`themor_${key}`) || '[]'); data[key] = Array.isArray(value) ? value : []; }
      catch { data[key] = []; }
    }
    return data;
  });
  const count = Object.values(snapshot).reduce((sum, rows) => sum + rows.length, 0);
  if (!count || done) return null;
  const handleImport = async () => {
    if (!await confirm({ title: '이전 저장 자료 가져오기', message: `이 브라우저에 저장된 상품·주문·신청 등 ${count}개 자료를 MySQL에 추가합니다. 같은 ID가 이미 있는 자료는 건너뛰며 기존 DB 자료와 브라우저 원본은 삭제하지 않습니다.`, confirmLabel: '가져오기' })) return;
    setBusy(true);
    try {
      const result = await databaseService.importLegacy(snapshot);
      showToast(`${result.total}개 자료를 MySQL에 추가했습니다. 기존 ID는 건너뛰었습니다.`);
      window.dispatchEvent(new Event('themor-data-changed'));
      setDone(true);
    } catch { /* Shared notification presents the API error. */ }
    finally { setBusy(false); }
  };
  return <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-slate-200 dark:border-slate-800"><div><h2 className="text-sm font-semibold">이 브라우저의 이전 저장 자료</h2><p className="text-xs text-slate-500 dark:text-slate-400 leading-6 mt-1">연동 전에 등록한 상품과 주문을 MySQL에 추가할 수 있습니다. 같은 ID의 자료는 유지됩니다.</p></div><button disabled={busy} onClick={handleImport} className="commerce-button-secondary shrink-0 disabled:opacity-50">{busy ? '가져오는 중…' : 'MySQL로 가져오기'}</button></section>;
}
