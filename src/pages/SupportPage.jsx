import React, { useState } from 'react';
import { Search, MessageSquare, ChevronDown, ArrowUpRight, Package, CreditCard, RotateCcw, Store, Headphones } from 'lucide-react';
import { FAQ_DATA } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import InquiryModal from '../components/customer/InquiryModal';
import PageHeading from '../components/common/PageHeading';

const topics = [
  { name: '배송/조회', label: '배송 안내', detail: '배송 일정과 조회 방법', icon: Package },
  { name: '주문/결제', label: '주문·결제', detail: '결제와 주문 변경 안내', icon: CreditCard },
  { name: '교환/반품', label: '교환·반품', detail: '접수 방법과 환불 안내', icon: RotateCcw },
  { name: '파트너/입점', label: '파트너·입점', detail: '브랜드와 셀러를 위한 안내', icon: Store },
];

export default function SupportPage({ onOpenAiChat }) {
  const { requests } = useShop();
  const { currentUser } = useAuth();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [category, setCategory] = useState('전체');
  const [query, setQuery] = useState('');
  const userInquiries = requests.filter(r => r.type === 'inquiry' && currentUser && (r.userId === currentUser.id || r.applicantEmail === currentUser.email));
  const filteredFaqs = FAQ_DATA.filter(f => (category === '전체' || f.category === category) && `${f.q} ${f.a}`.toLowerCase().includes(query.trim().toLowerCase()));
  const chooseCategory = value => { setCategory(value); setOpenFaq(null); };

  return (
    <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
      <PageHeading title="고객센터" description="무엇을 도와드릴까요? 자주 묻는 질문에서 답을 찾거나, 문의를 남겨주세요.">
        <button onClick={() => setIsInquiryModalOpen(true)} className="commerce-button"><MessageSquare size={17} />1:1 문의하기</button>
      </PageHeading>
      <section aria-label="도움말 주제" className="grid grid-cols-2 md:grid-cols-4 border-y border-slate-200 dark:border-slate-800">
        {topics.map(({ name, label, detail, icon: Icon }) => (
          <button key={name} onClick={() => { chooseCategory(name); document.getElementById('support-faq').scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="group text-left p-5 sm:p-7 border-slate-200 dark:border-slate-800 odd:border-r md:[&:not(:last-child)]:border-r hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <Icon size={24} strokeWidth={1.4} className="mb-6 text-slate-700 dark:text-slate-300" />
            <span className="flex items-center justify-between text-sm font-semibold">{label}<ArrowUpRight size={16} className="text-slate-400" /></span>
            <span className="block mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</span>
          </button>
        ))}
      </section>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_250px] gap-10 lg:gap-16">
        <section id="support-faq" className="scroll-mt-36 min-w-0">
          <h2 className="text-xl font-bold tracking-tight">자주 묻는 질문</h2>
          <div className="relative mt-6 mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} aria-hidden="true" />
            <input type="search" aria-label="자주 묻는 질문 검색" value={query} onChange={e => { setQuery(e.target.value); setOpenFaq(null); }} placeholder="궁금한 내용을 검색해 보세요" className="commerce-search" />
          </div>
          <div className="commerce-tabs" aria-label="질문 분류">
            {['전체', ...topics.map(t => t.name)].map(name => <button key={name} onClick={() => chooseCategory(name)} aria-pressed={category === name} className={category === name ? 'is-active' : ''}>{name}</button>)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 my-4" role="status">총 {filteredFaqs.length}개의 도움말</p>
          <div className="border-t border-slate-900 dark:border-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
            {filteredFaqs.map(faq => {
              const index = FAQ_DATA.indexOf(faq);
              const isOpen = openFaq === faq.q;
              return <div key={faq.q}>
                <h3><button id={`faq-question-${index}`} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(isOpen ? null : faq.q)} className="w-full flex items-start gap-3 sm:gap-5 py-6 text-left hover:text-slate-500 transition-colors">
                  <span className="hidden sm:block w-20 shrink-0 text-xs text-slate-500 dark:text-slate-400 pt-0.5">{faq.category}</span>
                  <span className="flex-1 text-sm font-medium leading-6">{faq.q}</span>
                  <ChevronDown size={18} className={`mt-1 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button></h3>
                <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={!isOpen} className="px-4 sm:pl-28 sm:pr-8 pb-7 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.a}</div>
              </div>;
            })}
            {!filteredFaqs.length && <div className="text-center py-14"><p className="font-medium text-sm">검색 결과가 없습니다.</p><p className="text-sm text-slate-500 mt-2">다른 검색어를 입력하거나 1:1 문의를 이용해 주세요.</p><button className="mt-5 underline underline-offset-4 text-sm" onClick={() => { setQuery(''); chooseCategory('전체'); }}>전체 질문 보기</button></div>}
          </div>
        </section>
        <aside className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-8 lg:pt-0 lg:pl-8">
          <Headphones size={25} strokeWidth={1.4} className="mb-5" />
          <h2 className="text-lg font-bold">도움이 더 필요하세요?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-6 mt-3 mb-6">해결하지 못한 궁금증은<br className="hidden lg:block" /> 상담 창구에 남겨주세요.</p>
          <button className="commerce-button-secondary w-full mb-3" onClick={onOpenAiChat}>채팅 상담 <ArrowUpRight size={16} /></button>
          <button className="commerce-button-secondary w-full" onClick={() => setIsInquiryModalOpen(true)}>1:1 문의하기 <ArrowUpRight size={16} /></button>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-6 text-xs leading-6 text-slate-500 dark:text-slate-400"><p className="font-semibold text-slate-900 dark:text-white mb-2">상담 운영 안내</p><p>평일 09:00–18:00</p><p>점심시간 12:00–13:00</p><p>주말·공휴일 휴무</p><p className="mt-3">온라인 문의는 언제든 접수할 수 있습니다.</p></div>
        </aside>
      </div>
      {!!userInquiries.length && <section><div className="flex justify-between border-b border-slate-900 dark:border-white pb-4"><h2 className="text-xl font-bold">나의 문의 내역</h2><span className="text-sm text-slate-500">{userInquiries.length}건</span></div><div className="divide-y divide-slate-200 dark:divide-slate-800">{userInquiries.map(inq => <article key={inq.id} className="py-6"><div className="flex gap-4 justify-between"><h3 className="text-sm font-semibold">{inq.title}</h3><StatusBadge status={inq.status} /></div><p className="mt-2 text-xs text-slate-500">{inq.date}</p><p className="mt-4 text-sm leading-7 whitespace-pre-line text-slate-600 dark:text-slate-300">{inq.details}</p>{inq.adminNote && <p className="border-l-2 border-slate-300 dark:border-slate-600 pl-4 mt-4 text-sm leading-7"><strong className="block mb-1">고객센터 답변</strong>{inq.adminNote}</p>}</article>)}</div></section>}
      <InquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
    </div>
  );
}
