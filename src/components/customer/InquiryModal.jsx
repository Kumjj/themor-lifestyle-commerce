import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';

export default function InquiryModal({ isOpen, onClose }) {
  const { submitRequest } = useShop();
  const { currentUser } = useAuth();

  const [category, setCategory] = useState('상품');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try { await submitRequest({
      type: 'inquiry',
      typeLabel: `1:1 문의 [${category}]`,
      title,
      applicantName: currentUser?.name || '고객',
      applicantEmail: email,
      targetItem: category,
      details: content
    });

    } catch { return; }
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="1:1 온라인 고객 문의 접수">
      <form onSubmit={handleSubmit} className="commerce-form space-y-4">
        <div>
          <label htmlFor="InquiryModal-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">문의 유형</label>
          <select id="InquiryModal-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="상품">상품 상세 및 재고 문의</option>
            <option value="배송">배송 지연 / 일정 확인</option>
            <option value="교환/환불">교환 / 반품 / 환불 신청</option>
            <option value="회원/혜택">회원 혜택 / 쿠폰 / 적립금</option>
            <option value="기타">기타 일반 문의</option>
          </select>
        </div>

        <div>
          <label htmlFor="InquiryModal-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">회신받을 이메일 주소</label>
          <input id="InquiryModal-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label htmlFor="InquiryModal-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">문의 제목</label>
          <input id="InquiryModal-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 명확히 입력해 주세요"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label htmlFor="InquiryModal-content" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">상세 문의 내용</label>
          <textarea id="InquiryModal-content"
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의 내용을 작성해 주시면 담당자가 확인 후 신속히 답변해 드립니다."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            문의 접수하기
          </button>
        </div>
      </form>
    </Modal>
  );
}
