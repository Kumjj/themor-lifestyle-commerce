import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export default function EditProductModal({ isOpen, onClose, product, onSave }) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('living');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSubtitle(product.subtitle || '');
      setCategory(product.category || 'living');
      setPrice(product.price ? String(product.price) : '');
      setStock(product.stock !== undefined ? String(product.stock) : '10');
      setImageUrl(product.imageUrl || '');
      setDescription(product.description || '');
      setIsDraft(Boolean(product.isDraft));
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try { await onSave(product.id, {
      name,
      subtitle,
      category,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl.trim() || product.imageUrl,
      description,
      isDraft,
      badge: isDraft ? '초안' : 'NEW'
    });
    onClose(); } catch { /* API error is displayed by the shared notification. */ }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in-up"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5 transition-colors max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
            Product Management
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            상품 정보 수정
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            상품명, 가격, 재고 및 공개 상태(임시저장/스토어 공개)를 변경할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="commerce-form space-y-4 text-xs sm:text-sm">
          {/* Status Segmented Control */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 select-none">
              게시 상태 (공개 여부)
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-md">
              <button
                type="button"
                onClick={() => setIsDraft(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
                  !isDraft
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>스토어 즉시 공개 (Live)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDraft(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
                  isDraft
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>임시저장 초안 (Draft)</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="EditProductModal-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
              상품명
            </label>
            <input id="EditProductModal-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
            />
          </div>

          <div>
            <label htmlFor="EditProductModal-subtitle" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
              간단 요약 (부제목)
            </label>
            <input id="EditProductModal-subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="한 줄 요약 설명"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="EditProductModal-category" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
                카테고리
              </label>
              <select id="EditProductModal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="EditProductModal-price" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
                판매 가격 (원)
              </label>
              <input id="EditProductModal-price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="EditProductModal-stock" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
                재고 수량
              </label>
              <input id="EditProductModal-stock"
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>
          </div>

          <div>
            <label htmlFor="EditProductModal-imageUrl" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
              이미지 URL
            </label>
            <input id="EditProductModal-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
            />
          </div>

          <div>
            <label htmlFor="EditProductModal-description" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">
              상세 설명
            </label>
            <textarea id="EditProductModal-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
            />
          </div>

          <div className="pt-3 flex gap-2.5">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>수정 사항 저장</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
