import React, { useState } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

export default function Footer({ setActivePage, activePage }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const navigateTo = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      e.currentTarget.reportValidity();
      return;
    }
    setSubscribed(true);
  };

  // 마이페이지와 장바구니 페이지에서는 사용자 요청에 따라 뉴스레터 구독 배너 숨김
  const shouldShowNewsletter = activePage !== 'mypage' && activePage !== 'cart';

  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-16 border-t border-gray-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* 1. Sleek Newsletter Subscription Strip (홈, 상품 목록, 고객센터 등에서만 표시) */}
      {shouldShowNewsletter && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 items-start gap-8 lg:gap-16">
              
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">THEMOR 뉴스레터</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  좋은 취향을 발견하는 소식.
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-7 break-keep">
                  새로운 컬렉션과 기획전, 회원을 위한 혜택까지.<br className="hidden sm:block" /> THEMOR의 새로운 이야기를 이메일로 만나보세요.
                </p>
              </div>

              <div className="w-full md:w-auto">
                {subscribed ? (
                  <div role="status" className="border-y border-slate-300 dark:border-slate-700 py-6 text-sm text-slate-900 dark:text-white">
                    <p className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} />신청한 이메일을 확인해 주세요.</p>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 break-all">{newsletterEmail}</p>
                    <p className="mt-3 text-xs">신규 회원 쿠폰 코드: THEMORWELCOME</p>
                    <button onClick={() => setSubscribed(false)} className="mt-4 text-xs underline underline-offset-4">이메일 변경</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full">
                    <label htmlFor="newsletter-email" className="text-sm font-medium text-slate-900 dark:text-white">이메일 주소</label>
                    <div className="flex items-stretch gap-2">
                      <input
                        type="email"
                        id="newsletter-email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="min-w-0 flex-1 h-12 px-4 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-base focus:outline-none focus:border-slate-900 dark:focus:border-white"
                        required
                      />
                      <button
                        type="submit"
                        className="commerce-button shrink-0"
                      >
                        <span>구독 신청</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <label className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400 cursor-pointer select-none pl-1">
                      <input type="checkbox" required className="rounded border-slate-300 dark:border-slate-700 w-4 h-4 text-slate-900" />
                      <span>개인정보 수집 및 혜택·기획전 알림 수신 동의 (필수)</span>
                    </label>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed pt-1">
              More than shopping — 일상에 감각적인 가치를 더하는 라이프스타일 커머스
            </p>
            <div className="pt-2 text-xs text-gray-500 dark:text-slate-400 space-y-1">
              <p>고객센터 <strong className="text-gray-900 dark:text-slate-200 font-semibold">1899-xxxx</strong> (평일 09:00 - 18:00)</p>
              <p>파트너십 제휴 문의: <span className="text-gray-700 dark:text-slate-300">partner@themor.corp</span></p>
            </div>
          </div>

          {/* Column 1: 쇼핑 카테고리 */}
          <div>
            <h4 className="text-gray-900 dark:text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3.5">쇼핑</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-slate-400">
              <li><button onClick={() => navigateTo('products')} className="hover:text-gray-900 dark:hover:text-white transition-colors">전체 상품</button></li>
              <li><button onClick={() => navigateTo('products')} className="hover:text-gray-900 dark:hover:text-white transition-colors">베스트셀러</button></li>
              <li><button onClick={() => navigateTo('products')} className="hover:text-gray-900 dark:hover:text-white transition-colors">가구 & 홈데코</button></li>
              <li><button onClick={() => navigateTo('products')} className="hover:text-gray-900 dark:hover:text-white transition-colors">주방 & 다이닝</button></li>
              <li><button onClick={() => navigateTo('products')} className="hover:text-gray-900 dark:hover:text-white transition-colors">생활 & 수납</button></li>
            </ul>
          </div>

          {/* Column 2: 파트너 & 비즈니스 */}
          <div>
            <h4 className="text-gray-900 dark:text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3.5">파트너 & 비즈니스</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-slate-400">
              <li><button onClick={() => navigateTo('participation')} className="hover:text-gray-900 dark:hover:text-white transition-colors">셀러 입점 신청</button></li>
              <li><button onClick={() => navigateTo('participation')} className="hover:text-gray-900 dark:hover:text-white transition-colors">광고 배너 게재 제휴</button></li>
              <li><button onClick={() => navigateTo('participation')} className="hover:text-gray-900 dark:hover:text-white transition-colors">신제품 기획 제안</button></li>
              <li><button onClick={() => navigateTo('participation')} className="hover:text-gray-900 dark:hover:text-white transition-colors">기업 단체 구매 / 특판</button></li>
            </ul>
          </div>

          {/* Column 3: 고객 서비스 */}
          <div>
            <h4 className="text-gray-900 dark:text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3.5">고객 지원</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-slate-400">
              <li><button onClick={() => navigateTo('support')} className="hover:text-gray-900 dark:hover:text-white transition-colors">자주 묻는 질문 (FAQ)</button></li>
              <li><button onClick={() => navigateTo('support')} className="hover:text-gray-900 dark:hover:text-white transition-colors">1:1 온라인 문의</button></li>
              <li><button onClick={() => navigateTo('mypage')} className="hover:text-gray-900 dark:hover:text-white transition-colors">주문 / 배송 조회</button></li>
              <li><button onClick={() => navigateTo('auth')} className="hover:text-gray-900 dark:hover:text-white transition-colors">사내 계정 로그인</button></li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal Disclaimers */}
        <div className="pt-6 border-t border-gray-200 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-500 leading-relaxed space-y-2 select-none">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600 dark:text-slate-400 font-normal pb-1">
            <span className="hover:text-gray-900 dark:hover:text-slate-200 cursor-pointer">회사소개</span>
            <span>|</span>
            <span className="hover:text-gray-900 dark:hover:text-slate-200 cursor-pointer">개인정보처리방침</span>
            <span>|</span>
            <span className="hover:text-gray-900 dark:hover:text-slate-200 cursor-pointer">이용약관</span>
            <span>|</span>
            <span className="hover:text-gray-900 dark:hover:text-slate-200 cursor-pointer">윤리경영</span>
            <span>|</span>
            <span className="hover:text-gray-900 dark:hover:text-slate-200 cursor-pointer">사업자정보확인</span>
          </div>

          <p>
            (주)더모어 코퍼레이션 | 대표이사: 김더모어 | 서울특별시 마포구 월드컵북로 400 더모어 스퀘어 본관 7층 | 사업자등록번호: 1899-0624-xxxx | 통신판매업신고: 2026-더모어_오피스텔-0127호
          </p>
          <p>
            호스팅서비스 제공자: (주)더모어 코퍼레이션 | 이메일: privacy@themor.corp | 고객센터: 1899-xxxx (평일 09:00 ~ 18:00)
          </p>
          <p className="pt-1 text-gray-400 dark:text-slate-600">
            Copyright © 2026 THEMOR Corporation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
