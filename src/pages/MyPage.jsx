import React, { useState, useEffect } from 'react';
import { useConfirm } from '../components/common/ConfirmProvider';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/common/Badge';
import { 
  User, 
  Package, 
  FileText, 
  Tag, 
  Trash2, 
  Edit3,
  Eye,
  EyeOff,
  Truck, 
  ShieldCheck, 
  Sun,
  Moon
} from 'lucide-react';
import EditProductModal from '../components/shop/EditProductModal';

export default function MyPage({ setActivePage, onSelectProduct }) {
  const confirm = useConfirm();
  const { currentUser, updateProfile, deleteAccount, logout, isAdmin } = useAuth();
  const { requests, orders, products, updateProduct, deleteProduct, showToast } = useShop();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'requests' | 'my-products' | 'profile'
  const [editingProduct, setEditingProduct] = useState(null);

  // Profile edit state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 max-w-md mx-auto my-12 transition-colors">
        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">로그인이 필요한 페이지입니다</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          회원 정보 및 주문 내역을 확인하시려면 먼저 로그인해 주세요.
        </p>
        <button
          onClick={() => setActivePage('auth')}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-semibold"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  const userRequests = requests.filter(r => 
    r.applicantEmail === currentUser.email || 
    r.applicantName.includes(currentUser.name) ||
    currentUser.role === 'admin'
  );

  const myRegisteredProducts = products.filter(p => 
    p.seller === currentUser.name || 
    p.sellerId === currentUser.id ||
    (currentUser.name && p.seller && p.seller.includes(currentUser.name)) ||
    (currentUser.role === 'admin' && !p.isOfficial)
  );

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try { await updateProfile({ name, phone, address }); showToast('회원 정보가 수정되었습니다.'); } catch (error) { showToast(error.message, 'error'); }
  };

  const handleDeleteAccount = async () => {
    if (await confirm({ title: '회원 탈퇴', message: '회원 탈퇴 시 모든 이용 정보가 초기화됩니다. 탈퇴하시겠습니까?', confirmLabel: '탈퇴하기' })) {
      try { await deleteAccount(); showToast('회원 탈퇴가 완료되었습니다.', 'info'); setActivePage('home'); } catch (error) { showToast(error.message, 'error'); }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-300">
      <header className="page-heading"><div><p className="mb-5 text-xs text-slate-500 dark:text-slate-400">THEMOR / 마이페이지</p><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">마이페이지</h1></div></header>
      <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-xl font-black shrink-0">
            {currentUser.name?.[0] || 'T'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {currentUser.name} 님
              </h2>
              {isAdmin && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700">
                  사내 관리자
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActivePage('participation')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md text-xs sm:text-sm font-semibold transition-colors"
          >
            상품·제휴 신청
          </button>
          <button
            onClick={() => logout().catch(error => showToast(error.message, 'error'))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'orders'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>주문 및 배송 ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'requests'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>신청 및 요청 내역 ({userRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('my-products')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'my-products'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>내 등록 상품 ({myRegisteredProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'profile'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>회원 정보</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div>
        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((ord) => (
                <div
                  key={ord.orderId}
                  className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 space-y-4 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{ord.orderDate}</span>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">주문번호: {ord.orderId}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800" />
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {Number(item.price).toLocaleString()}원 x {item.quantity}개
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {(Number(item.price) * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/60 p-3 rounded-md">
                    <div>
                      <span>배송지: <strong className="text-slate-800 dark:text-slate-200">{ord.shippingAddress}</strong> ({ord.recipient})</span>
                    </div>
                    <div className="text-right">
                      <span>결제 금액: <strong className="text-sm font-black text-slate-900 dark:text-white">{ord.totalAmount.toLocaleString()}원</strong></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                주문 내역이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests & Proposals Status (이모지 완전 제거) */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">신청 접수 심사 안내</span>
              <span>신청하신 배너 광고, 입점 제휴, 신제품 제안의 심사 진행 상태를 확인하실 수 있습니다.</span>
            </div>

            {userRequests.length > 0 ? (
              userRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 space-y-3 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{req.id}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {req.typeLabel}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{req.date}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{req.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                      {req.details}
                    </p>
                  </div>

                  {req.adminNote && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-md text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                      <strong>심사 결과 및 코멘트:</strong> {req.adminNote}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                접수된 신청 내역이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Products */}
        {activeTab === 'my-products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                등록하신 상품 목록입니다.
              </span>
              <button
                onClick={() => setActivePage('participation')}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                + 새 상품 등록
              </button>
            </div>

            {myRegisteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myRegisteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => onSelectProduct(p)}
                    >
                      <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-cover rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {p.isDraft ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              초안
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              공개중
                            </span>
                          )}
                          <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{p.name}</h4>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{Number(p.price).toLocaleString()}원</p>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">재고: {p.stock}개</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (await confirm({ title: '상품 삭제', message: `'${p.name}' 상품을 삭제하시겠습니까?\n삭제한 상품은 복구할 수 없습니다.`, confirmLabel: '삭제하기' })) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                등록된 판매 상품이 없습니다. [파트너 & 참여 허브]에서 상품을 등록해 보세요.
              </div>
            )}

            {/* Product Edit Modal */}
            <EditProductModal
              isOpen={Boolean(editingProduct)}
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
              onSave={updateProduct}
            />
          </div>
        )}

        {/* Tab 4: Profile Management (균형 잡힌 중앙 정렬 & 독립 회원탈퇴 영역 분리) */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* 1. Main Profile Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">기본 회원 정보</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  주문 배송 및 서비스 알림에 활용되는 기본 정보를 관리합니다.
                </p>
              </div>

              {/* Profile Info Form */}
              <form onSubmit={handleProfileSave} className="commerce-form space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="MyPage-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      이름 (성함)
                    </label>
                    <input id="MyPage-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-200 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="MyPage-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      휴대폰 번호
                    </label>
                    <input id="MyPage-phone"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-200 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    로그인 계정 (이메일)
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-500 dark:text-slate-500 cursor-not-allowed select-none"
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    계정 보안을 위해 이메일 주소는 관리자 승인 하에만 변경할 수 있습니다.
                  </span>
                </div>

                <div>
                  <label htmlFor="MyPage-address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    기본 배송지 주소
                  </label>
                  <input id="MyPage-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="도로명 주소 및 상세 주소를 입력하세요"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-200 transition-colors"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs active:scale-95 transition-all"
                  >
                    회원 정보 저장
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Isolated Danger Zone (계정 관리 및 회원 탈퇴 분리) */}
            <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200/70 dark:border-rose-900/40 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
              <div className="space-y-1">
                <h5 className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                  회원 탈퇴 (Account Danger Zone)
                </h5>
                <p className="text-[11px] sm:text-xs text-rose-600/80 dark:text-rose-300/70 leading-relaxed">
                  탈퇴 시 보유 적립금, 쿠폰, 주문 내역 및 셀러 등록 데이터가 즉시 영구 삭제되며 복구할 수 없습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-900 rounded-md text-xs font-semibold transition-all shrink-0 active:scale-95"
              >
                회원 탈퇴 진행
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
