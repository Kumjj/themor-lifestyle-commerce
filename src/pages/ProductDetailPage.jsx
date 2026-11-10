import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Star, 
  ArrowLeft, 
  Share2, 
  Bell, 
  AlertTriangle,
  AlertCircle,
  Minus,
  Plus
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ProductBadge } from '../components/common/Badge';
import QuickBuyModal from '../components/shop/QuickBuyModal';
import RestockModal from '../components/shop/RestockModal';
import ReportModal from '../components/shop/ReportModal';
import ProductReviews from '../components/shop/ProductReviews';
import { ownsProduct, getReviewSummary } from '../utils/product';

export default function ProductDetailPage({ product, onBack, onSelectProduct, setActivePage, previousPage }) {
  const { addToCart, toggleWishlist, isInWishlist, showToast } = useShop();
  const { currentUser } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'shipping' | 'reviews'
  
  // Modals state
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-20 transition-colors">
        <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">선택된 상품이 없습니다.</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const totalPrice = Number(product.price) * quantity;

  // Check if current user is the seller of this product
  const isMyProduct = ownsProduct(currentUser, product);
  const { count: reviewCount, rating } = getReviewSummary(product);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('상품 링크가 클립보드에 복사되었습니다.');
  };

  const handleOrderSuccess = (order) => {
    setActivePage('mypage');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto transition-colors duration-300">
      {/* 1. Back button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {previousPage === 'wishlist' 
              ? '관심 상품 목록으로 돌아가기' 
              : previousPage === 'cart' 
                ? '장바구니로 돌아가기' 
                : previousPage === 'mypage' 
                  ? '마이페이지로 돌아가기' 
                  : previousPage === 'home' 
                    ? '홈으로 돌아가기' 
                    : '상품 목록으로 돌아가기'}
          </span>
        </button>

        <div className="flex items-center gap-3 text-xs">
          {!isMyProduct && <><button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>상품 제보</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span></>}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>공유</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Info Layout (다크모드 완벽 대응) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-10 transition-colors">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 dark:bg-slate-950 rounded-md overflow-hidden border border-slate-100 dark:border-slate-800 relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.badge && <ProductBadge text={product.badge} />}
              {product.isOfficial && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-950 border border-transparent">
                  THEMOR 직영
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Purchase Info & Action */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Seller & Rating */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-300">{product.seller || 'THEMOR'}</span>
              <div className="flex items-center gap-1 font-semibold">
                {reviewCount > 0 && rating != null ? (
                  <>
                    <Star className="w-4 h-4 fill-current text-amber-500" />
                    <span className="text-amber-500">{Number(rating).toFixed(1)}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">({reviewCount}개 후기)</span>
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">아직 등록된 후기가 없습니다</span>
                )}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 space-y-1 transition-colors">
              <div className="flex items-baseline gap-2.5">
                {product.discountRate > 0 && (
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {product.discountRate}%
                  </span>
                )}
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {Number(product.price).toLocaleString()}원
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                    {Number(product.originalPrice).toLocaleString()}원
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                구매 시 결제 금액의 1% 적립 혜택
              </p>
            </div>

            {/* Delivery Details */}
            <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  <strong>배송 정보:</strong> {product.isFreeShipping ? '무료배송' : '기본 배송비 3,000원 (50,000원 이상 결제 시 무료)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  <strong>출고 예정:</strong> 평일 16:00 이전 주문 시 <strong>익일 안심 도착</strong> (수도권/광역시 기준)
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock ? (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 transition-colors">
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">주문 수량</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(재고: {product.stock}개)</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>현재 준비된 수량이 모두 소진되었습니다.</span>
                <button
                  onClick={() => setIsRestockOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>재입고 알림 신청</span>
                </button>
              </div>
            )}

            {/* Total Price */}
            {!isOutOfStock && (
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">총 상품 금액</span>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {totalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white ml-1">원</span>
                </div>
              </div>
            )}

            {/* Self-Purchase Restriction Warning */}
            {isMyProduct && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>본인이 등록한 판매 상품입니다. 자가 구매는 제한되며 마이페이지에서 상품 정보 수정 및 삭제가 가능합니다.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-md border transition-all ${
                isWished
                  ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-rose-500'
              }`}
              title="관심 상품 등록"
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
            </button>

            {!isOutOfStock ? (
              isMyProduct ? (
                <div className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-md text-xs sm:text-sm font-semibold text-center select-none cursor-not-allowed">
                  자가 등록 상품 (구매 불가)
                </div>
              ) : (
                <>
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 py-3.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>장바구니 담기</span>
                  </button>
                  <button
                    onClick={() => setIsQuickBuyOpen(true)}
                    className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>바로 구매하기</span>
                  </button>
                </>
              )
            ) : (
              <button
                onClick={() => setIsRestockOpen(true)}
                className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>재입고 알림 예약</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Detailed Tabs (다크모드 완벽 대응) */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-4 text-xs sm:text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            상세 사양 및 설명
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 py-4 text-xs sm:text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'shipping'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            배송 및 교환/반품 안내
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-xs sm:text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            고객 구매 후기 ({reviewCount})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-10">
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">상품 소개</h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {product.specs && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-3">상세 사양</h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <tbody>
                        {Object.entries(product.specs).map(([key, val], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-950/40' : 'bg-white dark:bg-slate-900'}>
                            <td className="w-1/3 px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                              {key}
                            </td>
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">배송 및 교환/반품 안내</h4>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                <li>배송 방식: THEMOR 물류센터 직영 전담 택배</li>
                <li>배송 지역: 전국 (도서산간 지역 추가 운임 발생 가능)</li>
                <li>출고 일정: 결제 완료 후 1~2영업일 이내 수령 (주말·공휴일 제외)</li>
                <li>교환/반품 기간: 상품 수령 후 7일 이내 접수 가능</li>
                <li>반품 배송비: 단순 변심의 경우 왕복 6,000원 부담 / 상품 하자 시 전액 무상</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ProductReviews product={product} />
          )}
        </div>
      </div>

      {/* Sub Modals */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
        product={product}
        quantity={quantity}
        onOrderSuccess={handleOrderSuccess}
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        product={product}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        product={product}
      />
    </div>
  );
}
