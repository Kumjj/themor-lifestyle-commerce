import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Mail, ArrowRight } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

export default function AuthPage({ setActivePage }) {
  const { login, register } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [accountInput, setAccountInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const user = await login(accountInput.trim(), password);
      setActivePage(user.role === 'admin' ? 'admin' : 'mypage');
    } catch (error) { setErrorMessage(error.message); }
    finally { setIsSubmitting(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await register({ name: regName, email: regEmail, password: regPassword, phone: regPhone, address: regAddress });
      setActivePage('mypage');
    } catch (error) { setErrorMessage(error.message); }
    finally { setIsSubmitting(false); }
  };

  const handleQuickLogin = (role) => {
    setAccountInput(role === 'admin' ? 'kjj' : 'sunrin');
    setPassword('');
    setErrorMessage('비밀번호를 입력한 뒤 로그인해 주세요.');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6 animate-fade-in-up">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-block">
          <BrandLogo size="lg" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          더 나은 라이프스타일을 위한 THEMOR에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors">
        
        {/* Login vs Register Mode Toggle Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              authMode === 'login'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              authMode === 'register'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            신규 회원가입
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-md text-xs text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Single Unified Login Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="commerce-form space-y-4">
            <div>
              <label htmlFor="AuthPage-accountInput" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 select-none">
                아이디 또는 이메일
              </label>
              <div className="relative">
                <input id="AuthPage-accountInput"
                  type="text"
                  required
                  placeholder="아이디 또는 이메일 주소를 입력하세요"
                  autoComplete="username"
                    value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="AuthPage-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 select-none">
                비밀번호
              </label>
              <div className="relative">
                <input id="AuthPage-password"
                  type="password"
                  required
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                    value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-md text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-white transition-colors shadow-xs"
              >
                로그인
              </button>
            </div>

            {/* Quick Demo Accounts Helper */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                데모 테스트 바로가기
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('user')}
                  className="py-2 px-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>일반 회원 계정</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="py-2 px-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>관리자 계정</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="commerce-form space-y-3.5">
            <div>
              <label htmlFor="AuthPage-regName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">성함</label>
              <input id="AuthPage-regName"
                type="text"
                required
                placeholder="성함을 입력하세요"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="AuthPage-regEmail" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">이메일 계정</label>
              <input id="AuthPage-regEmail"
                type="email"
                required
                placeholder="이메일 주소를 입력하세요"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="AuthPage-regPassword" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">비밀번호</label>
              <input id="AuthPage-regPassword"
                type="password"
                required
                placeholder="8자 이상 입력해 주세요"
                minLength={8}
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="AuthPage-regPhone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">연락처</label>
              <input id="AuthPage-regPhone"
                type="tel"
                placeholder="연락처를 입력하세요"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label htmlFor="AuthPage-regAddress" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 select-none">기본 배송지 주소</label>
              <input id="AuthPage-regAddress"
                type="text"
                placeholder="배송지 주소를 입력하세요"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-800 dark:focus:border-slate-300"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-md text-sm font-bold shadow-xs transition-colors"
              >
                회원가입 완료
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
