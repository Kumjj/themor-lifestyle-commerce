import React from 'react';
import { Heart, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ownsProduct } from '../utils/product';
import ProductCard from '../components/shop/ProductCard';

export default function WishlistPage({ setActivePage, onSelectProduct }) {
  const { products, wishlist, addToCart, showToast } = useShop();
  const { currentUser } = useAuth();

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    if (wishedProducts.length === 0) return;
    const buyable = wishedProducts.filter(prod => prod.stock > 0 && !ownsProduct(currentUser, prod));
    if (buyable.length === 0) {
      showToast('담을 수 있는 상품이 없습니다. (품절 또는 본인 등록 상품)', 'info');
      return;
    }
    buyable.forEach(prod => addToCart(prod, 1, { silent: true }));
    showToast(`${buyable.length}개의 관심 상품을 장바구니에 담았습니다.`);
  };

  if (wishedProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 sm:p-20 text-center space-y-4 max-w-2xl mx-auto my-8 transition-colors">
        <div className="w-14 h-14 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
          <Heart className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">관심 상품 목록이 비어 있습니다</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          마음에 드는 상품의 하트 아이콘을 눌러 관심 상품으로 보관해 보세요.
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
    <div className="space-y-6 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">관심 상품 (찜)</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            총 <strong className="text-slate-900 dark:text-white font-semibold">{wishedProducts.length}</strong>개의 상품을 보관 중입니다.
          </p>
        </div>

        <button
          onClick={handleAddAllToCart}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold shadow-xs hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>전체 장바구니 담기</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishedProducts.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
}
