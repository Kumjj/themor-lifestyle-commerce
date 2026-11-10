import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  X, 
  ChevronRight, 
  Headphones, 
  CheckCircle2, 
  ArrowLeft,
  Send,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Structured Hierarchical FAQ Tree
const CHATBOT_TREE = [
  {
    id: 'shipping',
    category: '배송 / 출고 문의',
    subQuestions: [
      {
        q: '오늘 주문하면 내일 도착하나요? (당일 출고 기준)',
        a: '평일 오후 4시(16:00) 이전 결제 완료 건은 THEMOR 스마트 물류센터에서 당일 출고되어 수도권 및 전국 주요 광역시 기준 익일 도착을 보장합니다. (도서산간 및 주문제작 상품 제외)'
      },
      {
        q: '결제 완료 후 배송지 주소를 변경할 수 있나요?',
        a: '상품이 [출고 준비 중] 상태가 되기 전인 [결제완료] 단계에서는 [마이페이지 > 주문내역]에서 즉시 주소 변경이 가능합니다. 이미 출고된 경우에는 택배사 인계 후 수정이 제한될 수 있습니다.'
      },
      {
        q: '배송 완료로 뜨는데 물건을 받지 못했어요.',
        a: '부재 시 경비실, 무인택배함 또는 문 앞 소화전 등에 위탁되었을 수 있습니다. 배송기사님의 통화 시도가 있었는지 확인 부탁드리며, 확인이 어려우실 경우 아래 [상담원과 대화하기]를 눌러주시면 즉시 확인 후 재배송 또는 안내를 도와드립니다.'
      }
    ]
  },
  {
    id: 'return',
    category: '교환 / 반품 / 환불',
    subQuestions: [
      {
        q: '단순 변심으로 인한 반품 및 환불 절차는 어떻게 되나요?',
        a: '상품 수령일로부터 7일 이내에 포장 및 부속품이 훼손되지 않은 상태라면 [마이페이지]에서 원클릭으로 반품 신청이 가능합니다. 지정 택배사 기사님이 1~2영업일 내에 방문 수거하며, 반품 배송비(왕복 6,000원)는 환불금에서 자동 차감됩니다.'
      },
      {
        q: '상품에 하자가 있거나 파손되어 도착했어요.',
        a: '배송 중 파손 또는 제품 불량의 경우 THEMOR에서 전액 무상 교환 및 환불을 보장합니다. 사진 1~2장을 준비해 주시면 신속히 맞교환 또는 환불 처리를 도와드립니다.'
      }
    ]
  },
  {
    id: 'order',
    category: '주문 / 결제 / 영수증',
    subQuestions: [
      {
        q: '주문을 부분 취소하거나 결제 수단을 변경하고 싶어요.',
        a: '배송 준비 이전 단계에서는 전체 주문 취소 후 원하시는 결제 수단으로 재결제를 권장해 드립니다. 부분 취소가 필요하신 경우 전문 상담원에게 말씀해 주시면 즉시 도와드립니다.'
      },
      {
        q: '현금영수증이나 세금계산서 발행은 어떻게 하나요?',
        a: '계좌이체 또는 무통장 입금 주문 시 결제 페이지에서 즉시 발행 신청이 가능하며, 이미 완료된 주문은 마이페이지 영수증 출력 탭에서 즉시 출력 및 국세청 전송 상태를 확인하실 수 있습니다.'
      }
    ]
  },
  {
    id: 'partnership',
    category: '셀러 입점 & 제휴',
    subQuestions: [
      {
        q: '개인 공방이나 브랜드도 THEMOR에 입점할 수 있나요?',
        a: '네, 상단 메뉴의 [파트너 & 참여 허브]에서 누구나 상품 판매 등록 및 입점 제휴를 신청하실 수 있습니다. 신규 입점 파트너에게는 초기 판매 수수료 우대 혜택을 드립니다.'
      },
      {
        q: '메인 광고 배너 게재 비용과 심사 기준이 궁금해요.',
        a: 'THEMOR 메인 홈 상단 배너 신청은 [파트너 & 참여 허브 > 광고 배너 신청]을 통해 접수하실 수 있으며, 상품의 품질과 이미지 규격을 심사하여 48시간 내에 승인 결과를 안내해 드립니다.'
      }
    ]
  }
];

export default function AiChatbotModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  
  // Step state: 'category' | 'sub' | 'answer' | 'live_agent'
  const [step, setStep] = useState('category');
  const [selectedCat, setSelectedCat] = useState(null);

  // Chat messages stream
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: '안녕하세요. THEMOR 공식 AI 고객센터입니다.\n궁금하신 문의 분야를 선택해 주시면 신속하게 안내해 드립니다. 전문 상담원과의 1:1 대화도 언제든 가능합니다.'
    }
  ]);

  // Live Agent & Typing States
  const [agentConnected, setAgentConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step, isTyping]);

  if (!isOpen) return null;

  // Category select with 1.5s typing delay
  const handleCategorySelect = (category) => {
    setSelectedCat(category);
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: `[${category.category}] 관련 문의`
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `'${category.category}' 분야의 주요 질문입니다. 확인하실 세부 질문을 선택해 주세요.`
        }
      ]);
      setStep('sub');
    }, 1500);
  };

  // Sub question select with 1.8s typing delay
  const handleSubSelect = (subItem) => {
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: subItem.q
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: subItem.a
        }
      ]);
      setStep('answer');
    }, 1800);
  };

  const handleResetToCategory = () => {
    setStep('category');
    setSelectedCat(null);
    setMessages(prev => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '처음 메뉴로 돌아왔습니다. 확인하실 문의 분야를 선택해 주세요.'
      }
    ]);
  };

  const handleConnectLiveAgent = () => {
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: '전문 상담원 연결 요청'
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setAgentConnected(true);
      setStep('live_agent');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-agent-assign-${Date.now()}`,
          sender: 'agent',
          agentName: '박소현 고객케어 매니저',
          text: `안녕하세요, ${currentUser?.name || '고객'}님. THEMOR 고객지원 매니저 박소현입니다. 문의 사항을 남겨주시면 주문 및 계정 내역을 조회하여 신속히 도와드리겠습니다.`
        }
      ]);
    }, 1800);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText
      }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          agentName: '박소현 고객케어 매니저',
          text: `문의해 주신 "${userText}" 내용 확인 중입니다. 고객님의 최근 주문 및 배송 상태를 점검하여 즉시 처리해 드리겠습니다. 잠시만 기다려 주시기 바랍니다.`
        }
      ]);
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg h-[640px] max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
              {agentConnected ? <Headphones className="w-4 h-4 text-slate-900" /> : <Bot className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm">
                  {agentConnected ? '박소현 매니저 (1:1 상담)' : 'THEMOR AI 고객상담 센터'}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-slate-400">
                {agentConnected ? '실시간 1:1 고객 케어 진행 중' : '스마트 FAQ 자동 답변 및 전문 상담원 연결'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50/70 dark:bg-slate-950 flex flex-col gap-3">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isAgent = m.sender === 'agent';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 max-w-[88%] animate-fade-in-up ${
                  isUser ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser 
                      ? 'bg-slate-900 dark:bg-slate-800 text-white' 
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : isAgent ? <Headphones className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div>
                  {isAgent && (
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold block mb-0.5">
                      {m.agentName}
                    </span>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-100 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Realistic Typing Indicator (1.5 ~ 2s delay) */}
          {isTyping && (
            <div className="flex items-start gap-2.5 self-start animate-fade-in-up">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0">
                {agentConnected ? <Headphones className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          {/* Category Tree Navigation Buttons */}
          {step === 'category' && !isTyping && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2 mt-2 animate-fade-in-up">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block px-1">
                문의 분야 선택
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {CHATBOT_TREE.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between transition-colors"
                  >
                    <span>{cat.category}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                
                <button
                  onClick={handleConnectLiveAgent}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-left text-xs font-semibold text-gray-900 dark:text-white flex items-center justify-between transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>전문 상담원 1:1 연결</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {step === 'sub' && selectedCat && !isTyping && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2 mt-2 animate-fade-in-up">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                  [{selectedCat.category}] 세부 질문
                </span>
                <button
                  onClick={handleResetToCategory}
                  className="text-[11px] text-gray-600 dark:text-slate-400 font-semibold flex items-center gap-0.5 hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> 이전 메뉴
                </button>
              </div>

              <div className="space-y-1.5">
                {selectedCat.subQuestions.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubSelect(sub)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 text-left text-xs font-medium text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {sub.q}
                  </button>
                ))}

                <button
                  onClick={handleConnectLiveAgent}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-left text-xs font-semibold text-gray-900 dark:text-white flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <span>원하는 질문이 없으신가요? (상담원 연결)</span>
                  <Headphones className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          )}

          {step === 'answer' && !isTyping && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs space-y-2 mt-2 animate-fade-in-up">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block px-1">
                안내가 도움이 되셨나요?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleResetToCategory}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>네, 해결되었습니다</span>
                </button>

                <button
                  onClick={handleConnectLiveAgent}
                  className="p-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-opacity"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>상담원과 대화하기</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Live Agent Chat Mode) */}
        {step === 'live_agent' && (
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="상담원에게 문의할 내용을 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              <span>전송</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
