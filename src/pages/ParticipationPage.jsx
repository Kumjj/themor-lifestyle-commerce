import React, { useState } from 'react';
import { useConfirm } from '../components/common/ConfirmProvider';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';
import { 
  Store, 
  Megaphone, 
  Lightbulb, 
  Handshake,
  Layers,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import PageHeading from '../components/common/PageHeading';
import EditProductModal from '../components/shop/EditProductModal';

export default function ParticipationPage({ setActivePage, onSelectProduct }) {
  const confirm = useConfirm();
  const { products, addProduct, updateProduct, deleteProduct, submitRequest, showToast } = useShop();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('product'); // 'product' | 'my-shelf' | 'banner' | 'proposal' | 'partnership'

  // Form 1: Product registration state
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState('living');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('20');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [isDraft, setIsDraft] = useState(false); // 네이버 스마트스토어처럼 임시저장(초안) or 즉시공개

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Form 2: Banner ad application state
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerPeriod, setBannerPeriod] = useState('1주일 (기본)');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerDetails, setBannerDetails] = useState('');

  // Form 3: Product Idea Proposal state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaTarget, setIdeaTarget] = useState('생활용품');
  const [ideaDesc, setIdeaDesc] = useState('');

  // Form 4: Store Partnership state
  const [partnerBrand, setPartnerBrand] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('인테리어/소품');
  const [partnerIntro, setPartnerIntro] = useState('');

  // Seller's registered items
  const myItems = products.filter(p => 
    currentUser && (
      p.seller === currentUser.name || 
      p.sellerId === currentUser.id || 
      (p.seller && p.seller.includes(currentUser.name))
    )
  );

  // Handle Product registration
  const handleProductSubmit = async (e, forceDraft = false) => {
    e.preventDefault();
    if (!e.currentTarget.closest('form').reportValidity()) return;
    if (!prodName.trim() || !prodPrice || Number(prodPrice) < 0 || Number(prodStock) < 0) return;

    const shouldDraft = forceDraft || isDraft;

    try { await addProduct({
      name: prodName,
      subtitle: prodSubtitle || `${currentUser?.name || '셀러'}의 등록 상품`,
      category: prodCategory,
      price: Number(prodPrice),
      stock: Number(prodStock),
      seller: currentUser?.name || '선린 (sunrin)',
      sellerId: currentUser?.id || 'user-sunrin',
      isOfficial: false,
      isDraft: shouldDraft,
      badge: shouldDraft ? '초안' : 'NEW',
      isFreeShipping: true,
      imageUrl: prodImageUrl.trim() || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      description: prodDesc || '등록된 상세 설명이 없습니다.'
    }); } catch { return; }

    setProdName('');
    setProdSubtitle('');
    setProdPrice('');
    setProdImageUrl('');
    setProdDesc('');

    if (shouldDraft) {
      showToast('상품이 [임시저장 초안]으로 안전하게 저장되었습니다.');
      setActiveTab('my-shelf');
    } else {
      showToast('상품이 스토어에 공식 공개 발행되었습니다.');
      setActivePage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Quick Publish draft
  const handlePublishDraft = async (prod) => {
    await updateProduct(prod.id, { isDraft: false, badge: 'NEW' });
    showToast(`'${prod.name}' 상품이 스토어에 공개되었습니다.`);
  };

  // Quick Hide back to draft
  const handleHideToDraft = async (prod) => {
    await updateProduct(prod.id, { isDraft: true, badge: '초안' });
    showToast(`'${prod.name}' 상품이 임시저장 상태로 전환되었습니다.`);
  };

  // Handle Banner Ad Request
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try { await submitRequest({
      type: 'banner',
      typeLabel: '광고 배너 게재 신청',
      title: bannerTitle,
      applicantName: currentUser?.name || '선린 (sunrin)',
      applicantEmail: currentUser?.email || 'sunrin@themor.kr',
      targetItem: `게재 희망 기간: ${bannerPeriod}`,
      details: `희망 배너 이미지: ${bannerImageUrl || '미첨부'}\n광고 상세 내용:\n${bannerDetails}`
    }); } catch { return; }

    setBannerTitle('');
    setBannerImageUrl('');
    setBannerDetails('');
    setActivePage('mypage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Idea Proposal
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try { await submitRequest({
      type: 'proposal',
      typeLabel: '신제품 아이디어 제안',
      title: ideaTitle,
      applicantName: currentUser?.name || '선린 (sunrin)',
      applicantEmail: currentUser?.email || 'sunrin@themor.kr',
      targetItem: ideaTarget,
      details: ideaDesc
    }); } catch { return; }

    setIdeaTitle('');
    setIdeaDesc('');
    setActivePage('mypage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Partnership
  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    try { await submitRequest({
      type: 'store',
      typeLabel: '협찬 및 입점 제휴 신청',
      title: `${partnerBrand} 입점 제휴 신청`,
      applicantName: currentUser?.name || '선린 (sunrin)',
      applicantEmail: currentUser?.email || 'partner@themor.kr',
      targetItem: partnerCategory,
      details: partnerIntro
    }); } catch { return; }

    setPartnerBrand('');
    setPartnerIntro('');
    setActivePage('mypage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) return <div className="py-16 text-center space-y-5"><h1 className="text-2xl font-bold">파트너 & 참여 허브</h1><p className="text-sm text-slate-500">상품 등록과 신청은 로그인 후 이용할 수 있습니다.</p><button onClick={() => setActivePage('auth')} className="commerce-button">로그인하기</button></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
      <PageHeading title="파트너 & 참여 허브" description="좋은 제품과 새로운 아이디어를 기다립니다. 상품 판매부터 브랜드 입점까지, THEMOR와 함께 시작하세요." />
      <div className="partner-workspace">
      <nav className="partner-nav" aria-label="파트너 업무">
        <p className="hidden lg:block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-5">파트너 서비스</p>
        {[
          ['product', '상품 등록', '새로운 상품을 판매해 보세요', Store],
          ['my-shelf', '내 등록 상품', `판매 상품과 임시저장 ${myItems.length}건`, Layers],
          ['banner', '광고 신청', '브랜드와 상품을 알려보세요', Megaphone],
          ['proposal', '신제품 제안', '일상 속 아이디어를 나눠주세요', Lightbulb],
          ['partnership', '입점·제휴', 'THEMOR의 파트너가 되어주세요', Handshake],
        ].map(([id, label, detail, Icon]) => (
          <button key={id} onClick={() => setActiveTab(id)} aria-pressed={activeTab === id} className={activeTab === id ? 'is-active' : ''}>
            <Icon size={18} strokeWidth={1.6} className="shrink-0" />
            <span><span className="block text-sm font-semibold">{label}</span><span className="hidden lg:block text-xs font-normal mt-1.5 leading-5 text-slate-500 dark:text-slate-400">{detail}</span></span>
          </button>
        ))}
        <p className="hidden lg:block text-xs leading-6 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-7 pt-5">신청한 내용과 검토 결과는<br />마이페이지에서 확인할 수 있습니다.</p>
      </nav>
      {/* 3. Main Form / Content Container */}
      <div className="partner-content min-w-0">
        
        {/* Tab 1: Product Registration */}
        {activeTab === 'product' && (
          <form onSubmit={(e) => handleProductSubmit(e, isDraft)} className="commerce-form space-y-7">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">셀러 상품 등록</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  상품을 임시저장해 검토하거나, 즉시 스토어에 정식 공개할 수 있습니다.
                </p>
              </div>

              {/* Draft vs Published Switcher: monochrome, no icons */}
              <div className="flex border border-slate-300 dark:border-slate-700 rounded-md overflow-hidden shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setIsDraft(false)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${
                    !isDraft
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  즉시 공개
                </button>
                <button
                  type="button"
                  onClick={() => setIsDraft(true)}
                  className={`px-4 py-2 text-xs font-semibold border-l border-slate-300 dark:border-slate-700 transition-colors ${
                    isDraft
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  임시저장
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ParticipationPage-prodName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">상품명</label>
                <input id="ParticipationPage-prodName"
                  type="text"
                  required
                  placeholder="예: 원목 미니 탁상 오거나이저"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label htmlFor="ParticipationPage-prodCategory" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">카테고리</label>
                <select id="ParticipationPage-prodCategory"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ParticipationPage-prodPrice" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">판매 가격 (원)</label>
                <input id="ParticipationPage-prodPrice"
                  type="number" min="0" step="1"
                  required
                  placeholder="29000"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label htmlFor="ParticipationPage-prodStock" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">초기 입고 수량 (개)</label>
                <input id="ParticipationPage-prodStock"
                  type="number" min="0" step="1"
                  required
                  placeholder="20"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ParticipationPage-prodSubtitle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">간단 요약 문구</label>
              <input id="ParticipationPage-prodSubtitle"
                type="text"
                placeholder="예: 천연 오크 원목과 황동 리벳으로 제작된 수공예 데스크 굿즈"
                value={prodSubtitle}
                onChange={(e) => setProdSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="ParticipationPage-prodImageUrl" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">대표 상품 이미지 URL (선택)</label>
              <input id="ParticipationPage-prodImageUrl"
                type="url"
                placeholder="https://example.com/product.jpg"
                value={prodImageUrl}
                onChange={(e) => setProdImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="ParticipationPage-prodDesc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">상세 제품 설명</label>
              <textarea id="ParticipationPage-prodDesc"
                rows={3}
                placeholder="제품의 소재, 규격, 사용 방법 및 특징을 자유롭게 기술해 주세요."
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={(e) => handleProductSubmit(e, true)}
                className="flex-1 h-11 border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 rounded-md text-sm font-semibold transition-colors select-none"
              >
                임시저장
              </button>
              <button
                type="submit"
                className="flex-1 h-11 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-md text-sm font-semibold transition-colors select-none"
              >
                상품 등록
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: My Registered Shelf & Drafts Management */}
        {activeTab === 'my-shelf' && (
          <div className="commerce-form space-y-7">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">내 등록 상품 & 임시 보관함</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  직접 등록한 상품의 공개 여부를 변경하거나 상품 정보를 관리할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('product')}
                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold rounded-lg hover:opacity-90"
              >
                + 새 상품 등록
              </button>
            </div>

            {myItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {myItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div 
                      className="flex items-center gap-3.5 cursor-pointer min-w-0"
                      onClick={() => onSelectProduct && onSelectProduct(prod)}
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-16 h-16 object-cover rounded-md border border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${prod.isDraft ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {prod.isDraft ? '임시저장' : '판매중'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{prod.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-900 dark:text-white font-semibold">{Number(prod.price).toLocaleString()}원</strong>
                          <span>·</span>
                          <span>재고: {prod.stock}개</span>
                          <span>·</span>
                          <span>{CATEGORIES.find(c => c.id === prod.category)?.name || prod.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {prod.isDraft ? (
                        <button
                          onClick={() => handlePublishDraft(prod)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-md text-xs font-semibold transition-colors select-none"
                        >
                          공개하기
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHideToDraft(prod)}
                          className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium transition-colors select-none"
                        >
                          비공개 전환
                        </button>
                      )}

                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                        title="상품 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={async () => {
                          if (await confirm({ title: '상품 삭제', message: `'${prod.name}' 상품을 삭제하시겠습니까?\n삭제한 상품은 복구할 수 없습니다.`, confirmLabel: '삭제하기' })) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-lg text-xs font-medium transition-colors"
                        title="상품 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm space-y-3">
                <p>아직 직접 등록하신 상품이 없습니다.</p>
                <button
                  onClick={() => setActiveTab('product')}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs font-bold"
                >
                  첫 상품 등록하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Banner Ad Application */}
        {activeTab === 'banner' && (
          <form onSubmit={handleBannerSubmit} className="commerce-form space-y-7">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">메인 광고 배너 게재 신청</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                THEMOR 메인 홈 상단 및 중간 와이드 프로모션 배너에 셀러의 브랜드와 상품을 노출할 수 있습니다.
              </p>
            </div>

            <div>
              <label htmlFor="ParticipationPage-bannerTitle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">배너 메인 타이틀</label>
              <input id="ParticipationPage-bannerTitle"
                type="text"
                required
                placeholder="예: 2026 친환경 천연 코르크 데스크 매트 런칭"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ParticipationPage-bannerPeriod" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">희망 게재 기간</label>
                <select id="ParticipationPage-bannerPeriod"
                  value={bannerPeriod}
                  onChange={(e) => setBannerPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                >
                  <option value="1주일 (기본)">1주일 (기본)</option>
                  <option value="2주일 (연장)">2주일 (연장)</option>
                  <option value="1개월 (장기 기획전)">1개월 (장기 기획전)</option>
                </select>
              </div>

              <div>
                <label htmlFor="ParticipationPage-bannerImageUrl" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">배너 이미지 시안 URL</label>
                <input id="ParticipationPage-bannerImageUrl"
                  type="url"
                  placeholder="https://..."
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ParticipationPage-bannerDetails" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">신청 사유 및 광고 프로모션 기획</label>
              <textarea id="ParticipationPage-bannerDetails"
                rows={3}
                required
                placeholder="광고를 통해 강조하고 싶은 셀링 포인트 및 랜딩 페이지 링크 등을 적어주세요."
                value={bannerDetails}
                onChange={(e) => setBannerDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                광고 신청하기
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Product Idea Proposal */}
        {activeTab === 'proposal' && (
          <form onSubmit={handleProposalSubmit} className="commerce-form space-y-7">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">신제품 아이디어 제안</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                일상에서 느낀 불편함이나 THEMOR가 직접 제조/출시해 주었으면 하는 상품 아이디어를 제안해 주세요.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ParticipationPage-ideaTitle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">제안 제목</label>
                <input id="ParticipationPage-ideaTitle"
                  type="text"
                  required
                  placeholder="예: 1인 가구를 위한 초슬림 벽걸이 빨래건조대"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label htmlFor="ParticipationPage-ideaTarget" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">대상 카테고리</label>
                <input id="ParticipationPage-ideaTarget"
                  type="text"
                  required
                  placeholder="예: 생활용품 / 원룸 인테리어"
                  value={ideaTarget}
                  onChange={(e) => setIdeaTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ParticipationPage-ideaDesc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">아이디어 상세 내용 및 예상 효과</label>
              <textarea id="ParticipationPage-ideaDesc"
                rows={4}
                required
                placeholder="제품의 구체적인 작동 방식, 예상 타겟 고객, 기존 제품과의 차별점을 자유롭게 설명해 주세요."
                value={ideaDesc}
                onChange={(e) => setIdeaDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                제안 제출하기
              </button>
            </div>
          </form>
        )}

        {/* Tab 5: Partnership & Official Store Application */}
        {activeTab === 'partnership' && (
          <form onSubmit={handlePartnerSubmit} className="commerce-form space-y-7">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">공식 브랜드 입점 및 협찬 제휴</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                기업 파트너십을 맺고 THEMOR 공식 유통망과 물류 풀필먼트를 이용하실 브랜드사를 모십니다.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ParticipationPage-partnerBrand" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">브랜드 / 기업명</label>
                <input id="ParticipationPage-partnerBrand"
                  type="text"
                  required
                  placeholder="예: 루미에르 아뜰리에"
                  value={partnerBrand}
                  onChange={(e) => setPartnerBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label htmlFor="ParticipationPage-partnerCategory" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">주요 취급 품목</label>
                <input id="ParticipationPage-partnerCategory"
                  type="text"
                  required
                  placeholder="예: 홈 프래그런스 / 세라믹 소품"
                  value={partnerCategory}
                  onChange={(e) => setPartnerCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ParticipationPage-partnerIntro" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 select-none">브랜드 소개 및 입점 희망 사항</label>
              <textarea id="ParticipationPage-partnerIntro"
                rows={4}
                required
                placeholder="브랜드의 철학, 월 생산 규모, 공식 홈페이지 또는 SNS 링크를 함께 남겨주시면 심사에 도움이 됩니다."
                value={partnerIntro}
                onChange={(e) => setPartnerIntro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                입점·제휴 신청하기
              </button>
            </div>
          </form>
        )}
      </div>

      </div>
      {/* Product Edit Modal */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={updateProduct}
      />
    </div>
  );
}
