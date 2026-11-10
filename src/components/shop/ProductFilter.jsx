import React from 'react';
import { CATEGORIES, SORT_OPTIONS } from '../../data/categories';

export default function ProductFilter({
  selectedCategory,
  onCategoryChange,
  selectedSubcategory = 'all',
  onSubcategoryChange,
  sortOption,
  onSortChange,
  onlyFreeShipping,
  onToggleFreeShipping,
  hideOutOfStock,
  onToggleHideOutOfStock,
  totalCount
}) {
  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);
  const subcategories = currentCategoryObj?.subcategories || [];

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6 transition-colors select-none">
      {/* 1. Category Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shrink-0 transition-colors ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* 2. Subcategory Pills Bar (해당 카테고리의 세부 컬렉션 표출) */}
      {selectedCategory !== 'all' && subcategories.length > 0 && onSubcategoryChange && (
        <div className="flex items-center gap-2 overflow-x-auto mt-3 p-3 bg-slate-50 dark:bg-slate-900 scrollbar-none">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 shrink-0 mr-1">세부 컬렉션:</span>
          <button
            onClick={() => onSubcategoryChange('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
              selectedSubcategory === 'all'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 font-bold'
                : 'bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-800'
            }`}
          >
            전체
          </button>
          {subcategories.map((sub) => {
            const isSubSelected = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => onSubcategoryChange(sub)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                  isSubSelected
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-950 font-bold'
                    : 'bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-800'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Secondary Filter Bar: Options & Count */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-gray-100 dark:border-slate-800 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <span>총 <strong className="text-gray-900 dark:text-white font-semibold">{totalCount}</strong>개의 상품</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Free Shipping Check */}
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={onlyFreeShipping}
              onChange={(e) => onToggleFreeShipping(e.target.checked)}
              className="rounded border-gray-300 dark:border-slate-700 text-slate-900 dark:bg-slate-950 focus:ring-slate-900 w-4 h-4"
            />
            <span>무료배송</span>
          </label>

          {/* Hide Out of Stock Check */}
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={hideOutOfStock}
              onChange={(e) => onToggleHideOutOfStock(e.target.checked)}
              className="rounded border-gray-300 dark:border-slate-700 text-slate-900 dark:bg-slate-950 focus:ring-slate-900 w-4 h-4"
            />
            <span>품절 제외</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
