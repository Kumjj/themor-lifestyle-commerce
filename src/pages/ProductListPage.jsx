import React, { useState, useMemo, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import ProductFilter from '../components/shop/ProductFilter';
import ProductCard from '../components/shop/ProductCard';
import ScrollReveal from '../components/common/ScrollReveal';
import { Search, X, PackageX } from 'lucide-react';

export default function ProductListPage({ 
  selectedCategory, 
  onSelectCategory, 
  selectedSubcategory = 'all',
  onSelectSubcategory,
  onSelectProduct,
  sortOption: externalSortOption,
  onSortChange: externalOnSortChange
}) {
  const { products, searchQuery, setSearchQuery } = useShop();

  const [internalSortOption, setInternalSortOption] = useState('popular');
  const sortOption = externalSortOption || internalSortOption;
  const setSortOption = externalOnSortChange || setInternalSortOption;

  const [onlyFreeShipping, setOnlyFreeShipping] = useState(false);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude unpublished drafts from public store
        if (p.isDraft) return false;

        // Category filter
        if (selectedCategory && selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        // Subcategory filter
        if (selectedSubcategory && selectedSubcategory !== 'all') {
          if (p.subcategory !== selectedSubcategory) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSub = p.subtitle?.toLowerCase().includes(q);
          const matchSeller = p.seller?.toLowerCase().includes(q);
          if (!matchName && !matchSub && !matchSeller) return false;
        }

        // Free shipping
        if (onlyFreeShipping && !p.isFreeShipping) return false;

        // Hide out of stock
        if (hideOutOfStock && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (sortOption === 'newest') return (b.id > a.id ? 1 : -1);
        if (sortOption === 'low-price') return a.price - b.price;
        if (sortOption === 'high-price') return b.price - a.price;
        if (sortOption === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortOption, onlyFreeShipping, hideOutOfStock]);

  const clearAllFilters = () => {
    onSelectCategory('all');
    if (onSelectSubcategory) onSelectSubcategory('all');
    setSearchQuery('');
    setOnlyFreeShipping(false);
    setHideOutOfStock(false);
    setSortOption('popular');
  };

  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Search status banner */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-white transition-colors">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>'{searchQuery}'</strong> 검색 결과 ({filteredProducts.length}개)
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>검색어 초기화</span>
          </button>
        </div>
      )}

      {/* Filter Component */}
      <ProductFilter
        selectedCategory={selectedCategory}
        onCategoryChange={(catId) => {
          onSelectCategory(catId);
          if (onSelectSubcategory) onSelectSubcategory('all');
        }}
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={onSelectSubcategory}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onlyFreeShipping={onlyFreeShipping}
        onToggleFreeShipping={setOnlyFreeShipping}
        hideOutOfStock={hideOutOfStock}
        onToggleHideOutOfStock={setHideOutOfStock}
        totalCount={filteredProducts.length}
      />

      {/* Product Grid with Scroll-Reveal & Tab Switch Animations */}
      {filteredProducts.length > 0 ? (
        <div 
          key={`${selectedCategory}-${sortOption}-${searchQuery}`}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredProducts.map((prod, index) => (
            <ScrollReveal
              key={prod.id}
              delay={Math.min((index % 4) * 50, 150)}
            >
              <ProductCard
                product={prod}
                onSelectProduct={onSelectProduct}
              />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <PackageX className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">조건에 일치하는 상품이 없습니다</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            선택하신 필터 조건에 해당하는 상품이 없습니다. 필터를 초기화해 보세요.
          </p>
          <div className="pt-2">
            <button
              onClick={clearAllFilters}
              className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
