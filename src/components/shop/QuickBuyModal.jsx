import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export default function QuickBuyModal({ isOpen, onClose, product, quantity = 1, onOrderSuccess }) {
  const { placeOrder } = useShop();
  const { currentUser } = useAuth();

  const [address, setAddress] = useState(currentUser?.address || '서울특별시 마포구 월드컵북로 400 더모어빌딩 7층');
  const [recipient, setRecipient] = useState(currentUser?.name || '김테스트');
  const [phone, setPhone] = useState(currentUser?.phone || '010-1234-5678');
  const [payMethod, setPayMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product) return null;

  const itemTotal = Number(product.price) * quantity;
  const shippingFee = product.isFreeShipping ? 0 : 3000;
  const grandTotal = itemTotal + shippingFee;

  const handleOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const newOrder = await placeOrder({
        items: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            imageUrl: product.imageUrl
          }
        ],
        totalAmount: grandTotal,
        shippingAddress: address,
        recipient: `${recipient} (${phone})`,
        paymentMethod: payMethod === 'card' ? '신용/체크카드' : '간편결제 (THEMOR Pay)'
      });

      onClose();
      if (onOrderSuccess) onOrderSuccess(newOrder);
    } catch { /* Shared API notification. */ }
    finally { setIsProcessing(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="주문서 작성 및 결제" maxWidth="max-w-md">
      <form onSubmit={handleOrder} className="commerce-form space-y-4">
        {/* Product Summary */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
          <img src={product.imageUrl} alt={product.name} className="w-14 h-14 object-cover rounded-lg" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{product.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{Number(product.price).toLocaleString()}원 x {quantity}개</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">합계: {itemTotal.toLocaleString()}원</p>
          </div>
        </div>

        {/* Shipping Form */}
        <div className="space-y-2 text-xs">
          <h5 className="font-semibold text-slate-800 dark:text-slate-200">배송 정보</h5>
          <div>
            <label htmlFor="QuickBuyModal-recipient" className="text-slate-500 dark:text-slate-400">받는 분 성함</label>
            <input id="QuickBuyModal-recipient"
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
            />
          </div>
          <div>
            <label htmlFor="QuickBuyModal-phone" className="text-slate-500 dark:text-slate-400">연락처</label>
            <input id="QuickBuyModal-phone"
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
            />
          </div>
          <div>
            <label htmlFor="QuickBuyModal-address" className="text-slate-500 dark:text-slate-400">배송 주소</label>
            <input id="QuickBuyModal-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <h5 className="font-semibold text-slate-800 dark:text-slate-200">결제 수단 선택</h5>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center justify-center gap-1.5 p-2.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${payMethod === 'card' ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400'}`}>
              <input
                type="radio"
                name="payMethod"
                value="card"
                checked={payMethod === 'card'}
                onChange={() => setPayMethod('card')}
                className="hidden"
              />
              <CreditCard className="w-3.5 h-3.5" />
              <span>신용/체크카드</span>
            </label>

            <label className={`flex items-center justify-center gap-1.5 p-2.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${payMethod === 'easy' ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400'}`}>
              <input
                type="radio"
                name="payMethod"
                value="easy"
                checked={payMethod === 'easy'}
                onChange={() => setPayMethod('easy')}
                className="hidden"
              />
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>THEMOR Pay</span>
            </label>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-md space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between">
            <span>주문 금액</span>
            <span>{itemTotal.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span>{shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800 text-sm">
            <span>최종 결제 금액</span>
            <span>{grandTotal.toLocaleString()}원</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 rounded-md text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isProcessing ? '결제 처리 중...' : `${grandTotal.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
