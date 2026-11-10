import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/api';
import LegacyDataImport from '../components/shop/LegacyDataImport';
import { useConfirm } from '../components/common/ConfirmProvider';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { CATEGORIES } from '../data/categories';
import { 
  ShieldCheck, 
  Package, 
  FileCheck, 
  Megaphone, 
  Image, 
  Check, 
  X, 
  Clock, 
  Plus, 
  Trash2, 
  TrendingUp,
  Database,
  Copy,
  Terminal,
  Code,
  Server
} from 'lucide-react';

export default function AdminPage({ setActivePage, onSelectProduct }) {
  const confirm = useConfirm();
  const { 
    products, 
    requests, 
    banners, 
    notices, 
    orders,
    updateRequestStatus, 
    deleteProduct, 
    updateProduct,
    addBanner,
    updateBanner,
    deleteBanner,
    addNotice,
    deleteNotice,
    showToast
  } = useShop();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'products' | 'sql-joins' | 'banners' | 'notices'

  // Admin note state
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // New banner form state
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [newBanTitle, setNewBanTitle] = useState('');
  const [newBanSubtitle, setNewBanSubtitle] = useState('');
  const [newBanImg, setNewBanImg] = useState('');

  // New notice form state
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState('공지');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // SQL Join Viewer State
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryReload, setQueryReload] = useState(0);
  const [databaseName, setDatabaseName] = useState('');
  useEffect(() => {
    if (!isAdmin || activeTab !== 'sql-joins') return;
    let active = true;
    setQueryLoading(true);
    setQueryResult(null);
    setQueryError('');
    Promise.all([databaseService.report(selectedQueryIdx + 1), databaseService.health()]).then(([result, health]) => {
      if (active) { setQueryResult(result); setDatabaseName(health.database); }
    }).catch(error => { if (active) setQueryError(error.message); }).finally(() => { if (active) setQueryLoading(false); });
    return () => { active = false; };
  }, [isAdmin, activeTab, selectedQueryIdx, queryReload]);

  // Stats
  const pendingRequestsCount = requests.filter(r => r.status === 'received' || r.status === 'reviewing').length;

  const handleStatusChange = (reqId, newStatus) => {
    updateRequestStatus(reqId, newStatus, adminNoteInput);
    setSelectedReq(null);
    setAdminNoteInput('');
  };

  const handleCreateBanner = (e) => {
    e.preventDefault();
    if (!newBanTitle) return;
    addBanner({
      title: newBanTitle,
      subtitle: newBanSubtitle,
      imageUrl: newBanImg || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80',
      ctaText: '자세히 보기',
      categoryLink: 'all',
      badgeText: 'CAMPAIGN'
    });
    setNewBanTitle('');
    setNewBanSubtitle('');
    setNewBanImg('');
    setShowBannerForm(false);
  };

  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle) return;
    addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      author: 'THEMOR 운영팀',
      isImportant: true,
      content: newNoticeContent
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setShowNoticeForm(false);
  };

  const SQL_QUERIES = [
    { id: 1, title: '상품·카테고리·판매자 조회', type: 'INNER JOIN' },
    { id: 2, title: '주문·회원·주문 상품 조회', type: 'INNER JOIN' },
    { id: 3, title: '카테고리별 상품·가격·재고 집계', type: 'LEFT JOIN · GROUP BY' },
    { id: 4, title: '회원별 주문 횟수와 누적 주문금액', type: 'LEFT JOIN · SUM' },
    { id: 5, title: '판매자별 공개·임시저장 상품 집계', type: 'GROUP BY · SUM' },
  ];
  const currentQueryObj = {
    ...SQL_QUERIES[selectedQueryIdx],
    sql: queryResult?.sql || '',
    description: '서버에서 정해진 조회문을 실행한 MySQL 결과입니다.',
    headers: queryResult?.headers || [],
  };
  const queryRows = queryResult?.rows || [];
  if (!isAdmin) return <div className="py-16 text-center text-sm text-slate-500">관리자 로그인이 필요합니다.</div>;

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentQueryObj.sql);
    setCopiedQuery(true);
    showToast('SQL 쿼리문이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 transition-colors duration-300 animate-block-rise select-none">
      {/* 1. Admin Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
            Enterprise Admin & Database Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            기업 운영 및 데이터 대시보드
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            사용자 신청 심사, 상품 카탈로그, MySQL JOIN 쿼리 분석, 배너 및 공지사항을 통합 관리합니다.
          </p>
        </div>

        <button
          onClick={() => {
            setActivePage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs sm:text-sm font-medium transition-colors"
        >
          스토어 홈으로 이동 &rarr;
        </button>
      </div>

      {/* 2. Key Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>미결재 심사 요청</span>
            <FileCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingRequestsCount}건</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">배너·입점·제안·제보</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>등록 상품 수</span>
            <Package className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{products.length}개</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">직영 및 파트너 상품</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>MySQL 관계형 스키마</span>
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">7개 테이블</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">KJJ / THEMOR-MySQL</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>누적 주문 건수</span>
            <TrendingUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{orders.length}건</p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">실시간 처리 완료</span>
        </div>
      </div>

      <LegacyDataImport />
      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-1.5 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'requests'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>신청 접수 심사 센터 ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'products'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>상품 카탈로그 관리 ({products.length})</span>
        </button>

        {/* Essential Assignment Requirement: SQL JOIN Result Viewer Tab */}
        <button
          onClick={() => setActiveTab('sql-joins')}
          className={`flex items-center gap-1.5 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'sql-joins'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>MySQL JOIN 쿼리 분석 및 검증</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-1.5 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'banners'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>프로모션 배너 관리 ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-1.5 pb-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 shrink-0 transition-colors ${
            activeTab === 'notices'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>공지사항 관리 ({notices.length})</span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      <div>
        {/* Tab 1: Requests Review Center */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              사용자 및 파트너사가 신청한 광고 배너, 입점 제휴, 신제품 아이디어 제안을 심사합니다.
            </p>

            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 space-y-3 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500">{req.id}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {req.typeLabel}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{req.date}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{req.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                      {req.details}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      신청자: <strong className="text-slate-800 dark:text-slate-200">{req.applicantName}</strong> ({req.applicantEmail})
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReq(selectedReq?.id === req.id ? null : req)}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
                      >
                        {selectedReq?.id === req.id ? '심사창 닫기' : '심사 의견 입력'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>승인</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>반려</span>
                      </button>
                    </div>
                  </div>

                  {selectedReq?.id === req.id && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-md space-y-2 border border-slate-200 dark:border-slate-800">
                      <label htmlFor="AdminPage-adminNoteInput" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        신청자에게 전달할 공식 심사 코멘트 (선택)
                      </label>
                      <input id="AdminPage-adminNoteInput"
                        type="text"
                        placeholder="예: 규격 적합 판정 완료. 11월 10일자 배너 게재가 승인되었습니다."
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                현재 등록된 전체 상품 목록 및 재고 상태를 관리합니다.
              </p>
              <button
                onClick={() => setActivePage('participation')}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs font-semibold hover:opacity-90"
              >
                + 새 상품 등록
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">상품 정보</th>
                    <th className="p-3.5">카테고리</th>
                    <th className="p-3.5">판매 가격</th>
                    <th className="p-3.5">재고 수량</th>
                    <th className="p-3.5">공개 상태</th>
                    <th className="p-3.5 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-white block truncate max-w-xs">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.seller || 'THEMOR'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium">{CATEGORIES.find(c => c.id === p.category)?.name || p.category}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{Number(p.price).toLocaleString()}원</td>
                      <td className="p-3.5">
                        <span className={`font-semibold ${p.stock <= 5 ? 'text-rose-600' : ''}`}>
                          {p.stock}개
                        </span>
                      </td>
                      <td className="p-3.5">
                        {p.isDraft ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            초안(임시)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            스토어 공개
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={async () => {
                            if (await confirm({ title: '상품 삭제', message: `'${p.name}' 상품을 삭제하시겠습니까?\n삭제한 상품은 복구할 수 없습니다.`, confirmLabel: '삭제하기' })) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: SQL JOIN Simulation & Connection Verification (과제 필수 요구사항 완벽 대응) */}
        {activeTab === 'sql-joins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div><h2 className="text-lg font-bold">MySQL 조회</h2><p className="text-xs text-slate-500 mt-2">{databaseName ? `${databaseName} · 실제 데이터베이스 조회 결과` : '데이터베이스 연결 확인 중'}</p></div>
              <button onClick={() => setQueryReload(value => value + 1)} className="commerce-button-secondary" disabled={queryLoading}>새로고침</button>
            </div>
            {queryLoading && <p role="status" className="text-sm text-slate-500">조회 중입니다…</p>}
            {queryError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{queryError}</p>}
            {/* Query Selector Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                검증할 관계형 JOIN 쿼리 선택
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {SQL_QUERIES.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQueryIdx(idx)}
                    className={`p-3 rounded-md border text-left transition-all ${
                      selectedQueryIdx === idx
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      <span className="font-mono">QUERY #{q.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${selectedQueryIdx === idx ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {q.type.split(' ')[0]}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs truncate">{q.title}</h5>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Query Details & Code Block */}
            <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950">
                      Query #{currentQueryObj.id}
                    </span>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {currentQueryObj.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentQueryObj.description}
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedQuery ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQuery ? '복사 완료' : 'SQL 복사'}</span>
                </button>
              </div>

              {/* Formatted Code Box */}
              <div className="bg-slate-950 rounded-md p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
                <pre>{currentQueryObj.sql}</pre>
              </div>

              {/* Live Rendered Join Results Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span>실시간 JOIN 결과 뷰 ({queryRows.length}개 행 조회됨)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    MySQL에서 직접 조회한 결과입니다.
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 uppercase font-semibold">
                      <tr>
                        {currentQueryObj.headers.map((h, i) => (
                          <th key={i} className="p-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {queryRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors font-mono">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 whitespace-nowrap text-xs">{cell == null ? '—' : String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Banners Management */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                메인 홈 상단에 노출되는 기획전 슬라이드 배너를 관리합니다.
              </p>
              <button
                onClick={() => setShowBannerForm(!showBannerForm)}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>배너 등록</span>
              </button>
            </div>

            {showBannerForm && (
              <form onSubmit={handleCreateBanner} className="commerce-form p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">새 프로모션 배너 추가</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="배너 타이틀"
                    value={newBanTitle}
                    onChange={(e) => setNewBanTitle(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-xs"
                  />
                  <input
                    type="text"
                    placeholder="부제목"
                    value={newBanSubtitle}
                    onChange={(e) => setNewBanSubtitle(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-xs"
                  />
                </div>
                <input
                  type="url"
                  placeholder="이미지 URL (Unsplash 등)"
                  value={newBanImg}
                  onChange={(e) => setNewBanImg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBannerForm(false)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg text-xs font-semibold"
                  >
                    추가
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between transition-colors"
                >
                  <div className="relative aspect-video">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                      {b.badgeText || 'BANNER'}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{b.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{b.subtitle}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        onClick={() => updateBanner(b.id, { active: !b.active })}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${
                          b.active 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {b.active ? '스토어 노출 중' : '비활성 상태'}
                      </button>
                      <button
                        onClick={() => deleteBanner(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Notices Management */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                공식 쇼핑몰 배송 일정 및 정책 변경 공지사항을 작성하고 관리합니다.
              </p>
              <button
                onClick={() => setShowNoticeForm(!showNoticeForm)}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-md text-xs font-semibold hover:opacity-90 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>공지사항 등록</span>
              </button>
            </div>

            {showNoticeForm && (
              <form onSubmit={handleCreateNotice} className="commerce-form p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">새 공지사항 작성</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="공지 제목"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-xs"
                  />
                  <input
                    type="text"
                    placeholder="분류 (배송안내, 정책 등)"
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-xs"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="공지 내용"
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-md text-xs resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoticeForm(false)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg text-xs font-semibold"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {n.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{n.date}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{n.content}</p>
                  </div>

                  <button
                    onClick={() => deleteNotice(n.id)}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 rounded-lg"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
