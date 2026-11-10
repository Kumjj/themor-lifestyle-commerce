import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Sun, 
  Moon, 
  Grid,
  Armchair,
  UtensilsCrossed,
  Package,
  Laptop,
  Briefcase,
  Coffee,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../data/categories';
import BrandLogo from '../common/BrandLogo';

const CATEGORY_ICONS = {
  all: Grid,
  living: Armchair,
  kitchen: UtensilsCrossed,
  lifestyle: Package,
  digital: Laptop,
  fashion: Briefcase,
  food: Coffee,
};

const CATEGORY_FEATURED = {
  all: {
    title: 'THEMOR 에디션 큐레이션',
    desc: '일상의 온도를 높이는 16개 카테고리 셀렉션',
    tag: 'ALL PRODUCTS',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
  },
  living: {
    title: '원목과 스틸의 미학',
    desc: '공간의 비율을 정돈하는 감각적인 모듈러 가구',
    tag: 'LIVING & HOME',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
  },
  kitchen: {
    title: '정갈한 테이블웨어',
    desc: '식사의 시간을 깊이 있게 채우는 세라믹 & 우드',
    tag: 'KITCHEN & DINING',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80'
  },
  lifestyle: {
    title: '숨 쉬는 미니멀 수납',
    desc: '시각적 노이즈를 덜어내는 기능성 오거나이저',
    tag: 'ORGANIZING',
    image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80'
  },
  digital: {
    title: '저소음 데스크테리어',
    desc: '몰입을 방해하지 않는 정밀한 디지털 기어',
    tag: 'DIGITAL GEAR',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'
  },
  fashion: {
    title: '절제된 비즈니스 에센셜',
    desc: '내구성과 심미성을 모두 갖춘 데일리 워크웨어',
    tag: 'OFFICE & LIFE',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
  },
  food: {
    title: '자연 본연의 풍미',
    desc: '엄선된 농가와 로스터리가 전하는 프리미엄 셀렉션',
    tag: 'GOURMET & TEA',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  }
};

export default function Navbar({ 
  activePage, 
  setActivePage, 
  onCategorySelect, 
  onSelectBest,
  currentSortOption
}) {
  const { currentUser, isAdmin } = useAuth();
  const { cart, wishlist, searchQuery, setSearchQuery, products } = useShop();
  const { isDark, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState('living');
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const megaMenuRef = useRef(null);
  const navContainerRef = useRef(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Click outside to close Mega Menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        navContainerRef.current && 
        !navContainerRef.current.contains(event.target)
      ) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setActivePage('products');
    setMegaMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (catId, subcategory = 'all') => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    if (onCategorySelect) onCategorySelect(catId, subcategory);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagSearch = (tag) => {
    setLocalSearch(tag.replace('#', ''));
    setSearchQuery(tag.replace('#', ''));
    setMegaMenuOpen(false);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page) => {
    setMegaMenuOpen(false);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToAllProducts = () => {
    setMegaMenuOpen(false);
    if (onCategorySelect) onCategorySelect('all');
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToBestSellers = () => {
    setMegaMenuOpen(false);
    if (onSelectBest) {
      onSelectBest();
    } else if (onCategorySelect) {
      onCategorySelect('all');
    }
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentActiveCategoryObj = CATEGORIES.find(c => c.id === hoveredCategory) || CATEGORIES[1];
  const currentFeatured = CATEGORY_FEATURED[hoveredCategory] || CATEGORY_FEATURED['living'];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
      {/* 1. Main Navbar Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Left: Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => navigateTo('home')}
              className="group focus:outline-none"
            >
              <BrandLogo size="md" />
            </button>
          </div>

          {/* Center: Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative hidden sm:block"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                aria-label="상품 검색"
                placeholder="상품, 브랜드, 카테고리 검색"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-11 pl-4 pr-12 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-md text-sm focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-11 w-11 text-slate-600 dark:text-slate-300 rounded-r-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                aria-label="검색"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right: Utility Icons (Theme, Wishlist, Cart, Profile) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all"
              title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              aria-label="화면 테마 전환"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigateTo('wishlist')}
              className={`p-2.5 rounded-xl relative transition-all active:scale-95 ${
                activePage === 'wishlist' 
                  ? 'bg-gray-100 dark:bg-slate-900 text-rose-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900'
              }`}
              title="관심 상품"
              aria-label="관심 상품"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigateTo('cart')}
              className={`p-2.5 rounded-xl relative transition-all active:scale-95 ${
                activePage === 'cart' 
                  ? 'bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900'
              }`}
              title="장바구니"
              aria-label="장바구니"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            <button
              onClick={() => navigateTo(currentUser ? 'mypage' : 'auth')}
              className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1 ${
                activePage === 'mypage' || activePage === 'auth'
                  ? 'bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900'
              }`}
              title={currentUser ? `${currentUser.name} 마이페이지` : '로그인'}
              aria-label="사용자 계정"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleSearchSubmit} className="mt-3 sm:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="공간별 가구 & 소품 검색..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-11 pl-4 pr-12 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-white"
            />
            <button type="submit" aria-label="상품 검색" className="absolute right-0 h-11 w-11 flex items-center justify-center text-slate-500">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. Sub Navigation Bar with Mega Menu */}
      <nav 
        ref={navContainerRef}
        className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-900 hidden md:block transition-colors relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            
            {/* Mega Menu Toggle Button */}
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-semibold border-r border-gray-100 dark:border-slate-900 transition-colors ${
                megaMenuOpen 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' 
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>전체 카테고리</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : 'text-gray-400'}`} />
            </button>

            {/* Primary Nav Tabs */}
            <button
              onClick={() => navigateTo('home')}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${
                activePage === 'home' 
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              홈
            </button>

            <button
              onClick={handleGoToAllProducts}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${
                activePage === 'products' && currentSortOption !== 'popular'
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              전체 상품
            </button>

            <button
              onClick={handleGoToBestSellers}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${
                activePage === 'products' && currentSortOption === 'popular'
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              베스트셀러
            </button>

            <button
              onClick={() => navigateTo('participation')}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${
                activePage === 'participation' 
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              파트너 & 참여 허브
            </button>

            <button
              onClick={() => navigateTo('support')}
              className={`px-4 py-3 text-xs sm:text-sm font-medium transition-colors ${
                activePage === 'support' 
                  ? 'text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              고객센터
            </button>
          </div>

          {/* Admin shortcut if logged in as admin */}
          {isAdmin && (
            <div className="flex items-center">
              <button
                onClick={() => navigateTo('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePage === 'admin'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                기업 관리자 센터
              </button>
            </div>
          )}
        </div>

        {/* 3. Multi-Column Mega Menu Dropdown */}
        <div 
          ref={megaMenuRef}
          className={`absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-2xl transition-all duration-200 z-50 overflow-hidden ${
            megaMenuOpen 
              ? 'opacity-100 max-h-[520px] pointer-events-auto py-6' 
              : 'opacity-0 max-h-0 pointer-events-none py-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-12 gap-8">
              
              {/* Column 1: Category Selection List (Width: 3 cols) */}
              <div className="col-span-3 border-r border-gray-100 dark:border-slate-800 pr-4 space-y-1">
                <div className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                  카테고리 탐색
                </div>
                {CATEGORIES.map((cat) => {
                  const IconComp = CATEGORY_ICONS[cat.id] || Package;
                  const isHovered = hoveredCategory === cat.id;
                  const count = cat.id === 'all'
                    ? products.filter(p => !p.isDraft).length
                    : products.filter(p => p.category === cat.id && !p.isDraft).length;

                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onFocus={() => setHoveredCategory(cat.id)}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between transition-colors border-l-2 select-none ${
                        isHovered
                          ? 'border-slate-900 dark:border-white bg-gray-50 dark:bg-slate-800/60 text-slate-950 dark:text-white font-bold'
                          : 'border-transparent text-gray-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs tabular-nums text-gray-400 dark:text-slate-500">{count}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Column 2: Subcategories & Popular Hashtags (Width: 5 cols) */}
              <div className="col-span-5 px-2">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {currentActiveCategoryObj.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      세부 컬렉션
                    </span>
                  </div>
                  <button
                    onClick={() => handleCategoryClick(currentActiveCategoryObj.id)}
                    className="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1"
                  >
                    전체 보기 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Subcategory Grid with Item Count */}
                <div className="grid grid-cols-2 gap-x-6 mb-6">
                  {(currentActiveCategoryObj.subcategories || ['소파/체어', '수납/서랍', '침실가구', '조명/홈데코']).map((sub, idx) => {
                    const subCount = products.filter(
                      p => p.category === currentActiveCategoryObj.id && p.subcategory === sub && !p.isDraft
                    ).length;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleCategoryClick(currentActiveCategoryObj.id, sub)}
                        className="text-left py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between select-none"
                      >
                        <span>{sub}</span>
                        <span className="text-xs tabular-nums text-gray-400 dark:text-slate-500">{subCount}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Curated keywords: plain typographic list, readable in both themes */}
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs font-bold text-gray-900 dark:text-white mb-2.5">
                    추천 큐레이션 키워드
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {['#미니멀인테리어', '#모듈러가구', '#저소음데스크', '#세라믹테이블', '#친환경패브릭', '#감성오브제'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagSearch(tag)}
                        className="text-[13px] text-gray-700 dark:text-slate-200 underline-offset-4 decoration-gray-300 dark:decoration-slate-600 hover:underline hover:text-slate-950 dark:hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Spotlight image — all category images stacked and cross-faded */}
              <div className="col-span-4 pl-4 border-l border-gray-100 dark:border-slate-800">
                <div className="relative overflow-hidden h-full min-h-[300px] bg-slate-900 text-white rounded-md select-none">
                  {Object.entries(CATEGORY_FEATURED).map(([catId, feat]) => (
                    <img
                      key={catId}
                      src={feat.image}
                      alt={feat.title}
                      draggable={false}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                        feat === currentFeatured ? 'opacity-70' : 'opacity-0'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <div key={hoveredCategory} className="absolute left-5 right-5 bottom-5 space-y-1.5 animate-fade-in-up">
                    <p className="text-[11px] tracking-widest text-white/70 uppercase">
                      {currentFeatured.tag}
                    </p>
                    <h4 className="text-lg font-bold text-white leading-snug">
                      {currentFeatured.title}
                    </h4>
                    <p className="text-xs text-white/75 leading-relaxed">
                      {currentFeatured.desc}
                    </p>
                    <button
                      onClick={() => handleCategoryClick(currentActiveCategoryObj.id)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white underline underline-offset-4 hover:text-white/80"
                    >
                      컬렉션 바로가기 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 px-4 py-4 space-y-2">
          <button 
            onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900"
          >
            홈
          </button>
          <button 
            onClick={() => { handleGoToAllProducts(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900"
          >
            전체 상품
          </button>
          <button 
            onClick={() => { handleGoToBestSellers(); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900"
          >
            베스트셀러
          </button>
          
          <div className="py-2 border-t border-gray-100 dark:border-slate-800">
            <div className="px-3 py-1 text-[11px] font-bold text-gray-400 dark:text-slate-500">
              카테고리
            </div>
            {CATEGORIES.slice(1).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg flex items-center justify-between"
              >
                <span>{cat.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <button 
              onClick={() => { navigateTo('participation'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900"
            >
              파트너 & 참여 허브
            </button>
            <button 
              onClick={() => { navigateTo('support'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900"
            >
              고객센터
            </button>
            <button 
              onClick={() => { navigateTo('mypage'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900"
            >
              마이페이지
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
