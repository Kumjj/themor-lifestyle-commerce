import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ownsProduct } from '../../utils/product';

export default function ReportModal({ isOpen, onClose, product }) {
  const { submitRequest, showToast } = useShop();
  const { currentUser } = useAuth();

  const [reason, setReason] = useState('표시광고법 위반 (허위·과대 광고)');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!product || ownsProduct(currentUser, product)) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const created = await submitRequest({
      type: 'report',
      targetProductId: product.id,
      typeLabel: `상품 제보 [${reason.split(' ')[0]}]`,
      title: `${product.name} 상품 권익 침해 제보`,
      applicantName: currentUser?.name || '고객 제보',
      applicantEmail: currentUser?.email || 'customer@themor.kr',
      targetItem: product.name,
      details: `[제보 유형]: ${reason}\n\n[상세 내용]:\n${details}`
    });

    if (!created) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDetails('');
      onClose();
      showToast('제보가 성공적으로 접수되었습니다. 신뢰안전팀에서 신속히 검토하겠습니다.');
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="상품 및 거래 안전 제보">
      {isSubmitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">제보가 정상적으로 접수되었습니다</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            THEMOR 신뢰안전센터에 전달되었으며, 면밀한 검증을 거쳐 관련 규정에 따라 조치하겠습니다.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="commerce-form space-y-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md text-xs leading-relaxed border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>THEMOR 신뢰안전센터 (Trust & Safety)</span>
            </div>
            <p>
              THEMOR는 건전한 거래 환경 조성을 위해 허위·과대 광고 및 권리 침해 상품을 상시 모니터링하고 있습니다. 작성해주신 내용은 담당 심사팀에 안전하게 전달됩니다.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">대상 상품명</label>
            <input
              type="text"
              readOnly
              value={product.name}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="ReportModal-reason" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">제보 유형 선택</label>
            <select id="ReportModal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="표시광고법 위반 (허위·과대 광고)">표시광고법 위반 (허위·과대 광고 의심)</option>
              <option value="지식재산권 및 상표권 침해 의심">지식재산권 및 상표권 침해 의심</option>
              <option value="안전 기준 부적합 / 유해 우려 상품">안전 인증 부적합 / 유해 우려 상품</option>
              <option value="가격 표기 오류 및 부당한 거래 조건">가격 표기 오류 및 비정상적 주문 취소</option>
              <option value="기타 소비자 권익 침해">기타 소비자 권익 침해</option>
            </select>
          </div>

          <div>
            <label htmlFor="ReportModal-details" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">구체적인 제보 사유</label>
            <textarea id="ReportModal-details"
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="문제가 되는 이미지, 설명 문구, 또는 관련 증빙 내용을 육하원칙에 따라 구체적으로 기재해 주시면 신속한 처리에 큰 도움이 됩니다."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-xs sm:text-sm font-semibold transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-rose-600 dark:bg-white dark:hover:bg-rose-600 text-white dark:text-slate-950 dark:hover:text-white rounded-md text-xs sm:text-sm font-bold transition-colors shadow-sm"
            >
              제보 접수하기
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
