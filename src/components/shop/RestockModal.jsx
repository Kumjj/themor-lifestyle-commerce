import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

export default function RestockModal({ isOpen, onClose, product }) {
  const { submitRequest } = useShop();
  const { currentUser } = useAuth();
  
  const [phone, setPhone] = useState(currentUser?.phone || '010-1234-5678');
  const [email, setEmail] = useState(currentUser?.email || '');

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitRequest({
      type: 'restock',
      typeLabel: '재입고 알림 요청',
      title: `${product.name} 재입고 알림 신청`,
      applicantName: currentUser?.name || '고객',
      applicantEmail: email,
      targetItem: product.name,
      details: `휴대폰: ${phone} / 이메일: ${email} 로 재입고 시 알림 메시지 발송 요청.`
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="재입고 알림 신청">
      <form onSubmit={handleSubmit} className="commerce-form space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">{product.name}</h4>
            <span className="text-xs text-rose-500 dark:text-rose-400 font-semibold">현재 일시 품절 상품입니다</span>
          </div>
        </div>

        <div>
          <label htmlFor="RestockModal-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">알림받을 휴대폰 번호</label>
          <input id="RestockModal-phone"
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label htmlFor="RestockModal-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">알림받을 이메일 주소</label>
          <input id="RestockModal-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          상품이 재입고되는 즉시 등록해주신 연락처로 알림을 발송해 드립니다.
        </p>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>알림 신청하기</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
