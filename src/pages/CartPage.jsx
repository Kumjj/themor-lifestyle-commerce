import React, { useState } from 'react';
import PageHeading from '../components/common/PageHeading';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  CreditCard,
  Truck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage({ setActivePage, onSelectProduct }) {
  const { 
    cart, 
    updateCartQuantity, 
    toggleCartItemSelection, 
    toggleAllCartItems, 
    removeFromCart, 
    placeOrder 
  } = useShop();
  const { currentUser } = useAuth();

  const [isOrdering, setIsOrdering] = useState(false);

  // Selected items calculation
  const selectedItems = cart.filter(item => item.selected);
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;

  const itemTotal = selectedItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const shippingFee = selectedItems.length > 0 ? (itemTotal >= 50000 || selectedItems.every(i => i.isFreeShipping) ? 0 : 3000) : 0;
  const grandTotal = itemTotal + shippingFee;

  const handleOrderSelected = async () => {
    if (selectedItems.length === 0) return;
    setIsOrdering(true);

    try {
      await placeOrder({
        items: selectedItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl
        })),
        totalAmount: grandTotal,
        shippingAddress: currentUser?.address || '서울특별시 마포구 월드컵북로 400 더모어빌딩 7층',
        recipient: `${currentUser?.name || '김테스트'} (${currentUser?.phone || '010-1234-5678'})`,
        paymentMethod: '신용/체크카드'
      }, { fromCart: true });

      setActivePage('mypage');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { /* Shared API notification. */ }
    finally { setIsOrdering(false); }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 sm:p-20 text-center space-y-4 max-w-2xl mx-auto my-8 transition-colors">
        <div className="w-14 h-14 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">장바구니가 비어 있습니다</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          THEMOR의 실용적인 라이프스타일 상품들을 장바구니에 담아보세요.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              setActivePage('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            상품 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors duration-300 animate-fade-in-up">
      <PageHeading title="장바구니" description="담아둔 상품을 확인하고 주문을 이어가세요.">
        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          총 <strong className="text-slate-900 dark:text-white">{cart.length}</strong>개 품목
        </span>
      </PageHeading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header Select All Bar */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs sm:text-sm transition-colors">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200 select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleAllCartItems(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 dark:border-slate-700 dark:bg-slate-950"
              />
              <span>전체 선택 ({selectedItems.length}/{cart.length})</span>
            </label>

            <button
              onClick={() => {
                selectedItems.forEach(i => removeFromCart(i.id));
              }}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              선택 삭제
            </button>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {cart.map((item) => {
              const itemSubtotal = Number(item.price) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={!!item.selected}
                      onChange={() => toggleCartItemSelection(item.id)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 dark:border-slate-700 dark:bg-slate-950 shrink-0"
                    />
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onClick={() => onSelectProduct(item)}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{item.seller || 'THEMOR'}</span>
                      <h4
                        onClick={() => onSelectProduct(item)}
                        className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 cursor-pointer hover:underline"
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {Number(item.price).toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Quantity counter */}
                    <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[90px]">
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {itemSubtotal.toLocaleString()}원
                      </span>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-5 sticky top-28 shadow-xs transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">주문 예상 금액</h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>선택 상품 금액 ({selectedItems.length}개)</span>
                <span className="font-semibold text-slate-900 dark:text-white">{itemTotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center">
                <span>배송비</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">무료</span>
                  ) : (
                    `+${shippingFee.toLocaleString()}원`
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  50,000원 이상 결제 시 전 상품 무료배송
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">최종 결제 금액</span>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {grandTotal.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white ml-1">원</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleOrderSelected}
                disabled={selectedItems.length === 0 || isOrdering}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-40 text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isOrdering ? '결제 처리 중...' : `${grandTotal.toLocaleString()}원 결제하기`}
                </span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-md text-[11px] text-slate-500 dark:text-slate-400 space-y-1 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Truck className="w-3.5 h-3.5" />
                <span>안심 배송 안내</span>
              </div>
              <p>평일 16시 이전 결제 완료 건은 당일 출고되어 익일 안전하게 배송됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
