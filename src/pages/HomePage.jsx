import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Modal from '../components/common/Modal';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/categories';
import ProductCard from '../components/shop/ProductCard';
import ScrollReveal from '../components/common/ScrollReveal';

// 광고 종료 시각 (마운트 기준 3일 14시간 후)
const AD_DURATION_MS = ((3 * 24 + 14) * 3600 + 28 * 60 + 45) * 1000;

const pad = (n) => String(n).padStart(2, '0');

function SectionHeader({ title, onMore, moreLabel = '전체보기' }) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
      {onMore && (
        <button
          onClick={onMore}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors select-none"
        >
          <span>{moreLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function HomePage({ setActivePage, onSelectProduct, onSelectCategory }) {
  const { products, banners, showToast } = useShop();
  const reducedMotion = useReducedMotion();

  const activeBanners = banners.filter(b => b.active);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const timerRef = useRef(null);

  // 프로모션 팝업
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // 광고 카운트다운
  const adEndRef = useRef(Date.now() + AD_DURATION_MS);
  const [remain, setRemain] = useState(AD_DURATION_MS);
  useEffect(() => {
    const t = setInterval(() => setRemain(Math.max(0, adEndRef.current - Date.now())), 1000);
    return () => clearInterval(t);
  }, []);
  const rSec = Math.floor(remain / 1000);
  const countdown = [
    { v: pad(Math.floor(rSec / 86400)), u: '일' },
    { v: pad(Math.floor((rSec % 86400) / 3600)), u: '시간' },
    { v: pad(Math.floor((rSec % 3600) / 60)), u: '분' },
    { v: pad(rSec % 60), u: '초' }
  ];

  const [activeCategoryTab, setActiveCategoryTab] = useState('living');

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeBanners.length > 1 && !reducedMotion) {
      timerRef.current = setInterval(() => {
        setCurrentBannerIdx(prev => (prev + 1) % activeBanners.length);
      }, 6000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeBanners.length, reducedMotion]);

  const handlePrevBanner = () => {
    setCurrentBannerIdx(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
    resetTimer();
  };
  const handleNextBanner = () => {
    setCurrentBannerIdx(prev => (prev + 1) % activeBanners.length);
    resetTimer();
  };
  const handleSelectBannerDot = (idx) => {
    setCurrentBannerIdx(idx);
    resetTimer();
  };

  const publishedProducts = products.filter(p => !p.isDraft);
  const bestProducts = publishedProducts.filter(p => p.badge === 'BEST' || p.rating >= 4.8).slice(0, 4);
  const newProducts = publishedProducts.filter(p => p.badge === 'NEW' || p.category === 'living').slice(0, 4);

  const categoryHighlights = {
    living: {
      title: '미니멀 모듈러 가구 & 릴랙스 홈데코',
      subtitle: '공간의 형태에 맞춰 자유롭게 조립하는 친환경 목재 시스템과 아늑한 조명',
      image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=1000&auto=format&fit=crop&q=80'
    },
    kitchen: {
      title: '감각적인 브런치 테이블웨어 & 쿡웨어',
      subtitle: '내열 유리 머그와 PFOA Free 세라믹 냄비로 일상의 식탁을 완성',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=80'
    },
    lifestyle: {
      title: '단정한 정리정돈 & 호텔식 욕실 에센셜',
      subtitle: '황변 없는 투명 아크릴 수납함과 3초 쾌속 건조 소프트 규조토 매트',
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1000&auto=format&fit=crop&q=80'
    },
    digital: {
      title: '스마트 워크스페이스 & 데스크테리어',
      subtitle: '손목이 편안한 버티컬 마우스와 듀얼 무선 키보드로 완성하는 몰입의 공간',
      image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=1000&auto=format&fit=crop&q=80'
    },
    fashion: {
      title: '지속 가능한 리사이클 데일리 백 & 오피스 굿즈',
      subtitle: '100% 재생 캔버스 토트백과 이탈리아 천연 베지터블 소가죽 카드 지갑',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000&auto=format&fit=crop&q=80'
    },
    food: {
      title: '스페셜티 로스팅 원두 & 프리미엄 식음료',
      subtitle: '당일 로스팅 시그니처 블렌드와 지중해 저온 압착 엑스트라 버진 올리브오일',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1000&auto=format&fit=crop&q=80'
    }
  };

  const currentHighlight = categoryHighlights[activeCategoryTab] || categoryHighlights.living;
  const currentCategoryProducts = publishedProducts.filter(p => p.category === activeCategoryTab).slice(0, 3);
  const activeCategoryName = CATEGORIES.find(c => c.id === activeCategoryTab)?.name;

  const goCategory = (id) => {
    if (onSelectCategory) onSelectCategory(id);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyCoupon = async () => {
    try { await navigator.clipboard.writeText('THEMORWELCOME'); }
    catch { showToast('쿠폰 코드 THEMORWELCOME을 직접 입력해 주세요.'); return; }
    setCouponCopied(true);
    showToast('쿠폰 코드가 복사되었습니다.');
    setTimeout(() => setCouponCopied(false), 2500);
  };

  return (
    <div className="space-y-16 sm:space-y-20 transition-colors duration-300 animate-block-rise">
      {/* 1. 메인 히어로 슬라이더 */}
      {activeBanners.length > 0 && (
        <section className="relative overflow-hidden rounded-lg bg-[#f5f4f0] dark:bg-slate-900 border border-[#e5e3dc] dark:border-slate-800 transition-colors duration-300">
          <div className="relative min-h-[380px] md:min-h-[460px] flex items-center">
            {activeBanners.map((banner, index) => {
              const isActive = index === currentBannerIdx;
              return (
                <div
                  key={banner.id}
                  aria-hidden={!isActive}
                  inert={isActive ? undefined : ''}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-center px-6 pt-8 pb-24 sm:px-12 sm:pt-12 ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-85 dark:opacity-40 mix-blend-multiply dark:mix-blend-luminosity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f5f4f0] via-[#f5f4f0]/90 to-transparent dark:from-slate-950 dark:via-slate-950/85 dark:to-transparent" />

                  <div className="relative max-w-xl z-20 space-y-3 select-none">
                    {banner.badgeText && (
                      <p className="text-xs tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                        {banner.badgeText}
                      </p>
                    )}
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                      {banner.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {banner.subtitle}
                    </p>
                    <div className="pt-3">
                      <button
                        onClick={() => {
                          if (banner.categoryLink === 'participation') {
                            setActivePage('participation');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            goCategory(banner.categoryLink);
                          }
                        }}
                        className="inline-flex items-center gap-2 h-11 px-6 bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 rounded-md text-sm font-semibold transition-colors"
                      >
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={handlePrevBanner}
                  className="absolute right-16 bottom-5 z-20 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/70 text-slate-900 dark:text-white transition-colors"
                  aria-label="이전 배너"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextBanner}
                  className="absolute right-4 bottom-5 z-20 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/70 text-slate-900 dark:text-white transition-colors"
                  aria-label="다음 배너"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-6 sm:left-12 z-20 flex items-center gap-3 select-none">
                  <span className="text-xs tabular-nums font-semibold text-slate-800 dark:text-white">
                    {pad(currentBannerIdx + 1)} / {pad(activeBanners.length)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeBanners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectBannerDot(i)}
                        className={`h-8 border-y-[15px] border-transparent bg-clip-content transition-all duration-300 ${
                          i === currentBannerIdx ? 'w-6 bg-slate-900 dark:bg-white' : 'w-4 bg-slate-400/60 dark:bg-white/40'
                        }`}
                        aria-current={i === currentBannerIdx ? 'true' : undefined}
                        aria-label={`${i + 1}번째 배너`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section aria-label="신규 회원 혜택" className="welcome-banner">
        <div className="flex items-center gap-6 sm:gap-9">
          <span className="text-4xl sm:text-5xl font-semibold tracking-tighter tabular-nums shrink-0">10<span className="text-2xl sm:text-3xl">%</span></span>
          <div><h2 className="text-sm sm:text-base font-bold">처음 만나는 THEMOR, 웰컴 쿠폰</h2><p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">신규 회원을 위한 10% 할인 혜택을 만나보세요.</p></div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-4 sm:pt-0">
          <span className="text-xs tracking-wider font-mono">THEMORWELCOME</span>
          <button onClick={handleCopyCoupon} className="commerce-button-secondary shrink-0">{couponCopied ? '복사 완료' : '쿠폰 코드 복사'}<ArrowRight size={16} /></button>
        </div>
      </section>
      <div className="home-notice">
        <span className="text-xs font-semibold shrink-0">프로모션 광고</span>
        <button onClick={() => setIsPromoModalOpen(true)} className="min-w-0 flex-1 flex items-center justify-between gap-4 py-4 text-left text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><span className="truncate">신규 회원 10% 웰컴 쿠폰과 배송 혜택 안내</span><ChevronRight size={16} className="shrink-0" /></button>
      </div>

      {/* 3. 카테고리별 컬렉션 */}
      <section>
        <SectionHeader title="카테고리별 컬렉션" onMore={() => goCategory('all')} />

        {/* 카테고리 탭: 줄바꿈 가능한 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
            const isSelected = activeCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                aria-pressed={isSelected}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`py-3.5 text-sm text-center border-b-2 -mb-px transition-colors select-none ${
                  isSelected
                    ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* 좌: 에디토리얼 이미지 */}
          <button
            onClick={() => goCategory(activeCategoryTab)}
            className="lg:col-span-5 group relative overflow-hidden min-h-[360px] bg-slate-200 dark:bg-slate-800 text-left select-none rounded-md"
          >
            {Object.entries(categoryHighlights).map(([id, h]) => (
              <img
                key={id}
                src={h.image}
                alt={h.title}
                draggable={false}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-[1.03] ${
                  id === activeCategoryTab ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transitionProperty: 'opacity, transform', transitionDuration: '850ms, 700ms' }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <motion.div key={activeCategoryTab} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className="absolute left-6 right-6 bottom-6 text-white">
              <h4 className="text-xl sm:text-2xl font-bold leading-snug">{currentHighlight.title}</h4>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">{currentHighlight.subtitle}</p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold underline underline-offset-4">
                {activeCategoryName} 보러가기 <ArrowRight className="w-4 h-4" />
              </span>
            </motion.div>
          </button>

          {/* 우: 상품 */}
          <div key={activeCategoryTab} className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4" aria-label={`${activeCategoryName} 추천 상품`}>
            {currentCategoryProducts.map((prod, idx) => (
              <motion.div key={prod.id} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.95, delay: reducedMotion ? 0 : idx * 0.12, ease: [0.22, 1, 0.36, 1] }}>
                <ProductCard product={prod} onSelectProduct={onSelectProduct} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 베스트셀러 */}
      <section>
        <SectionHeader title="주간 베스트" onMore={() => goCategory('all')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestProducts.map((prod, index) => (
            <ScrollReveal key={prod.id} delay={index * 60}>
              <ProductCard product={prod} onSelectProduct={onSelectProduct} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 5. 입점 셀러 스폰서 광고 */}
      <section aria-label="스폰서 광고" className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-900">
        {/* 광고주 헤더 */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white dark:bg-slate-950">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 bg-white text-slate-900 flex items-center justify-center text-xl font-black shrink-0 select-none">
              L
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold leading-tight truncate">루미에르 아뜰리에</p>
              <p className="text-xs text-white/60 mt-0.5 truncate">Lumière Atelier · THEMOR 공식 입점 셀러</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-xs">
            <span className="text-white/60 select-none">광고</span>
            <button
              onClick={() => { setActivePage('participation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hidden sm:inline text-white/80 hover:text-white underline underline-offset-4 select-none"
            >
              광고 문의
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* 좌: 대형 사진 + 상품 */}
          <div className="grid grid-cols-2">
            {[
              { src: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', name: '아치형 플로어 스탠드', price: '74,000원', rate: '19%' },
              { src: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80', name: '노르딕 라운지 1인 암체어', price: '189,000원', rate: '24%' }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => goCategory('living')}
                className="group text-left select-none"
              >
                <div className="aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.src}
                    alt={item.name}
                    draggable={false}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                </div>
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-sm mt-0.5">
                    <span className="font-bold text-red-600 dark:text-red-400 mr-2">{item.rate}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.price}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* 우: 광고 카피 */}
          <div className="p-6 sm:p-10 flex flex-col justify-center gap-7 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                빛과 원목이 머무는 휴식,<br />2026 스프링 에디션
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                핸드크래프트 아치 플로어 스탠드와 부클레 라운지 체어를 THEMOR 단독 혜택가로 만나보세요.
              </p>
            </div>

            {/* 혜택 수치 */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800 select-none">
              {[
                { big: '25%', small: '최대 할인' },
                { big: '0원', small: '배송비' },
                { big: '증정', small: '원목 코스터' }
              ].map((b) => (
                <div key={b.small} className="py-4 text-center">
                  <p className="text-2xl sm:text-3xl font-black tabular-nums text-slate-900 dark:text-white">{b.big}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.small}</p>
                </div>
              ))}
            </div>

            {/* 카운트다운 */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="select-none">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">특가 종료까지</p>
                <div className="flex items-end gap-3">
                  {countdown.map((c, i) => (
                    <div key={c.u} className="flex items-end gap-3">
                      <div className="text-center">
                        <p className="text-3xl sm:text-4xl font-black tabular-nums leading-none text-slate-900 dark:text-white">{c.v}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">{c.u}</p>
                      </div>
                      {i < countdown.length - 1 && (
                        <span className="text-2xl font-light text-slate-300 dark:text-slate-600 pb-4">:</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => goCategory('living')}
                className="inline-flex items-center gap-2 h-12 px-7 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-md text-sm font-semibold transition-colors select-none"
              >
                <span>기획전 보러가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 신상품 */}
      <section>
        <SectionHeader title="새로 들어왔어요" onMore={() => goCategory('all')} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newProducts.map((prod, index) => (
            <ScrollReveal key={prod.id} delay={index * 60}>
              <ProductCard product={prod} onSelectProduct={onSelectProduct} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 7. 프로모션 팝업 (뷰포트 중앙 고정) */}
      <Modal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} title="신규 회원 혜택 안내" maxWidth="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-2 relative min-h-[180px] md:min-h-[340px] bg-slate-200 dark:bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80"
                alt="THEMOR 물류센터"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center gap-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  전국 익일 배송 허브 확장,<br />웰컴 쿠폰 10% 증정
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                  평일 16시 이전 주문은 당일 출고됩니다. 쿠폰 코드를 결제 단계에서 입력하면 전 상품 10% 할인이 적용돼요.
                </p>
              </div>

              <div className="flex items-center justify-between border-y border-slate-200 dark:border-slate-800 py-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">쿠폰 코드</p>
                  <p className="text-lg font-mono font-black tracking-widest text-slate-900 dark:text-white mt-0.5">THEMORWELCOME</p>
                </div>
                <button
                  onClick={handleCopyCoupon}
                  className="h-10 px-5 border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-sm font-semibold text-slate-900 dark:text-white rounded-md transition-colors select-none"
                >
                  {couponCopied ? '복사 완료' : '코드 복사'}
                </button>
              </div>

              <button
                onClick={() => { setIsPromoModalOpen(false); goCategory('all'); }}
                className="h-12 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-md text-sm font-semibold transition-colors select-none"
              >
                전체 상품 보러가기
              </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
