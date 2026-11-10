import { getReviewSummary } from '../../utils/product';
import React from 'react';
import { Heart, Star } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { ProductBadge } from '../common/Badge';

export default function ProductCard({ product, onSelectProduct }) {
  const { count: reviewCount, rating } = getReviewSummary(product);
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const isWished = isInWishlist(product.id);

  const formattedPrice = Number(product.price).toLocaleString();
  const formattedOriginalPrice = product.originalPrice ? Number(product.originalPrice).toLocaleString() : null;

  return (
    <div 
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800/80 overflow-hidden hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col cursor-pointer select-none"
      onClick={() => onSelectProduct(product)}
    >
      {/* 1. Image Showcase Container */}
      <div className="relative aspect-square bg-gray-50 dark:bg-slate-950 overflow-hidden select-none">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out pointer-events-none select-none"
          loading="lazy"
          draggable={false}
        />

        {/* Badges (네온/알약 배제한 정갈한 사각 마이크로 라벨) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {product.badge && <ProductBadge text={product.badge} />}
          {product.isOfficial && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 select-none">
              직영
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl border border-gray-200/60 dark:border-slate-800 transition-all duration-200 shadow-xs z-10 active:scale-90 ${
            isWished 
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500' 
              : 'bg-white/90 dark:bg-slate-900/90 text-gray-400 dark:text-gray-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800'
          }`}
          title="관심 상품 추가"
        >
          <Heart className={`w-4 h-4 transition-transform duration-200 ${isWished ? 'fill-current scale-110' : ''}`} />
        </button>
      </div>

      {/* 2. Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Subcategory & Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-medium">{product.seller || 'THEMOR'}</span>
            <div className="flex items-center gap-1 font-semibold">
              {reviewCount > 0 && rating != null ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span className="text-amber-500">{Number(rating).toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({reviewCount})</span>
                </>
              ) : (
                <span className="text-gray-400 font-normal text-[11px]">후기 없음</span>
              )}
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Subtitle */}
          {product.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
              {product.subtitle}
            </p>
          )}
        </div>

        {/* Price & Shipping */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-baseline gap-2">
            {product.discountRate > 0 && (
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                {product.discountRate}%
              </span>
            )}
            <span className="text-base font-black text-gray-900 dark:text-white">
              {formattedPrice}원
            </span>
            {formattedOriginalPrice && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                {formattedOriginalPrice}원
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            {product.isFreeShipping ? (
              <span className="text-blue-600 dark:text-blue-400 font-bold">무료배송</span>
            ) : (
              <span>배송비 3,000원</span>
            )}

            {product.stock <= 0 ? (
              <span className="text-rose-500 dark:text-rose-400 font-bold">일시품절</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">마감임박 ({product.stock}개)</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">재고 여유</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
