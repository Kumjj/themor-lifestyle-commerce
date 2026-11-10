import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/common/Toast';
import { ConfirmProvider } from './components/common/ConfirmProvider';
import AiChatbotModal from './components/customer/AiChatbotModal';

// Pages
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AuthPage from './pages/AuthPage';
import MyPage from './pages/MyPage';
import ParticipationPage from './pages/ParticipationPage';
import SupportPage from './pages/SupportPage';
import AdminPage from './pages/AdminPage';

import { MessageCircle } from 'lucide-react';

function MainApp() {
  const { dataError, refreshData } = useShop();
  const [activePage, setActivePage] = useState('home');
  const [previousPage, setPreviousPage] = useState('products');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [productSortOption, setProductSortOption] = useState('popular');

  // Scroll to top on page switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, selectedProduct]);

  // Product Selection handler: records source page for accurate back navigation
  const handleSelectProduct = (product) => {
    if (activePage !== 'product-detail') {
      setPreviousPage(activePage);
    }
    setSelectedProduct(product);
    setActivePage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category Selection handler (supports subcategory filtering)
  const handleSelectCategory = (catId, subcategory = 'all') => {
    setSelectedCategory(catId);
    setSelectedSubcategory(subcategory);
    setProductSortOption('newest');
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Best Sellers Direct Link handler (버그 해결: 인기순 정렬로 명확히 연결)
  const handleSelectBestSellers = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setProductSortOption('popular');
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950 transition-colors duration-300">
      <a href="#main-content" className="skip-link">본문으로 바로가기</a>
      {/* 1. Global Toast Notifications */}
      <Toast />

      {/* 2. Top Header & Navigation (로고 최상단 단일 헤더) */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onCategorySelect={handleSelectCategory}
        onSelectBest={handleSelectBestSellers}
        currentSortOption={productSortOption}
      />

      {/* 3. Main Page Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {dataError && <div role="alert" className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 py-4 mb-6 text-sm"><p>자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p><button onClick={refreshData} className="shrink-0 underline underline-offset-4">다시 불러오기</button></div>}
        {activePage === 'home' && (
          <HomePage
            setActivePage={setActivePage}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {activePage === 'products' && (
          <ProductListPage
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
            onSelectProduct={handleSelectProduct}
            sortOption={productSortOption}
            onSortChange={setProductSortOption}
          />
        )}

        {activePage === 'product-detail' && (
          <ProductDetailPage
            product={selectedProduct}
            previousPage={previousPage}
            onBack={() => {
              setActivePage(previousPage || 'products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectProduct={handleSelectProduct}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'cart' && (
          <CartPage
            setActivePage={setActivePage}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'wishlist' && (
          <WishlistPage
            setActivePage={setActivePage}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'auth' && (
          <AuthPage setActivePage={setActivePage} />
        )}

        {activePage === 'mypage' && (
          <MyPage
            setActivePage={setActivePage}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'participation' && (
          <ParticipationPage 
            setActivePage={setActivePage} 
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'support' && (
          <SupportPage onOpenAiChat={() => setIsAiChatOpen(true)} />
        )}

        {activePage === 'admin' && (
          <AdminPage
            setActivePage={setActivePage}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </main>

      {/* 4. Floating Quick AI Customer Service Button (우측 하단 단일 유지 & 고대비 프리미엄 디자인) */}
      <aside aria-label="고객센터 실시간 상담 열기">
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="chat-launcher fixed right-4 sm:right-6 z-40 h-12 px-4 bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-md shadow-lg flex items-center gap-2.5 font-bold text-xs sm:text-sm border border-slate-800 dark:border-slate-200 transition-colors group select-none cursor-pointer"
          title="THEMOR 고객센터 실시간 상담 열기"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">채팅 상담</span>
        </button>
      </aside>

      {/* 5. Hierarchical AI Chatbot Modal */}
      <AiChatbotModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      {/* 6. Clean Professional Footer (상단과 동일한 로고 & 1899-xxxx) */}
      <Footer setActivePage={setActivePage} activePage={activePage} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ShopProvider>
          <ConfirmProvider><MainApp /></ConfirmProvider>
        </ShopProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
