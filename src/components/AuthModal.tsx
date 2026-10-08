import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail,
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Flame,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { 
  loginWithIdAndPassword, 
  registerWithIdAndPassword, 
  googleSignIn,
  firebaseAnonymousSignIn,
  firebaseLogout,
  firebaseResetPassword,
  getCurrentFirebaseUser
} from '../lib/classroomAuth';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile, message?: string, token?: string, googleUser?: any) => void;
  onLogoutSuccess?: () => void;
  currentUserName?: string;
}

type AuthTab = 'google' | 'email' | 'guest';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogoutSuccess,
  currentUserName
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('email');
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [grade, setGrade] = useState('高校2年生');
  const [targetGoal, setTargetGoal] = useState('定期テストで自己ベスト更新！');

  // Password reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentFbUser, setCurrentFbUser] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentFbUser(getCurrentFirebaseUser());
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsResetMode(false);
      setResetSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Firebase Google Sign-In
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        const rawName = res.user.displayName || '生徒';
        const formattedName = rawName.includes('の学習ダッシュボード')
          ? rawName
          : `${rawName}さんの学習ダッシュボード`;

        const googleProfile: UserProfile = {
          id: `user_google_${res.user.uid.slice(0, 8)}`,
          name: formattedName,
          roleTitle: 'Firebase (Google認証)',
          avatar: res.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          totalStudyMinutes: 0,
          todayStudyMinutes: 0,
          streakDays: 1,
          targetGoal: '志望校合格・期末テスト対策',
          competitionEnabled: true,
          weeklyPoints: 100,
          totalPoints: 100,
          rankLeague: 'ゴールド'
        };

        setSuccessMessage(`Firebase Google認証完了！Classroom課題を同期しています...`);
        setTimeout(() => {
          onLoginSuccess(googleProfile, `Firebase認証完了: ${rawName}さん`, res.accessToken, res.user);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Firebase Googleログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Firebase Email/Password Sign-In or Register
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isResetMode) {
        await firebaseResetPassword(emailOrId);
        setResetSent(true);
        setSuccessMessage(`再設定メールを送信しました。メールフォルダをご確認ください。`);
        return;
      }

      if (emailMode === 'login') {
        const { profile } = await loginWithIdAndPassword(emailOrId, password);
        setSuccessMessage(`Firebaseログイン完了！学習データとClassroomを同期しています...`);
        setTimeout(() => {
          onLoginSuccess(profile, `Firebaseログイン完了: ${profile.name}さん`);
          onClose();
        }, 700);
      } else {
        const { profile } = await registerWithIdAndPassword(
          emailOrId, 
          password, 
          displayName || emailOrId, 
          grade, 
          targetGoal
        );
        setSuccessMessage(`Firebase新規アカウント登録完了！学習スペースを初期化中...`);
        setTimeout(() => {
          onLoginSuccess(profile, `Firebaseアカウント作成完了: ${profile.name}さん`);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ログインまたは登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Firebase Anonymous Guest Sign-In
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, profile } = await firebaseAnonymousSignIn();
      setSuccessMessage(`Firebaseゲストとして認証完了！すぐにお試しいただけます。`);
      setTimeout(() => {
        onLoginSuccess(profile, `Firebaseゲストログイン: ${profile.name}`, undefined, user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Firebaseゲストログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Firebase Logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await firebaseLogout();
      setCurrentFbUser(null);
      setSuccessMessage('Firebaseからログアウトしました');
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage('ログアウトに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setActiveTab('email');
    setEmailMode('login');
    setEmailOrId('student01');
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header with Firebase theme (Amber & Orange to Blue) */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-blue-600 px-6 pt-6 pb-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <Flame className="w-6 h-6 text-amber-200 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Firebase ログイン</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white border border-white/30">
                  Firebase Auth
                </span>
              </div>
              <p className="text-xs text-amber-100">クラウド連携・学習記録の確実な保存・Classroom同時同期</p>
            </div>
          </div>

          {/* Current user badge if authenticated */}
          {currentFbUser && (
            <div className="mt-3 p-2.5 rounded-xl bg-black/20 border border-white/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">
                  現在ログイン中: <strong className="text-white">{currentFbUser.displayName || currentFbUser.email || 'ゲストユーザー'}</strong>
                  {currentFbUser.isAnonymous && <span className="ml-1 text-[10px] text-amber-200">(匿名)</span>}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-rose-500 text-white font-bold text-[11px] transition flex items-center gap-1 shrink-0 ml-2"
              >
                <LogOut className="w-3 h-3" />
                ログアウト
              </button>
            </div>
          )}

          {/* Tab Selector: Google / Email / Guest */}
          <div className="mt-3 grid grid-cols-3 gap-1 bg-black/25 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>メール・ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('guest');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'guest'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>ゲスト(匿名)</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-bold">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: Google Login */}
          {activeTab === 'google' && (
            <div className="space-y-4 py-2 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Googleアカウントでセキュア認証
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Firebase Authentication を介して Google アカウントにログインします。Google Classroom の受講クラス・課題・提出期限も同時に自動同期されます。
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                    </svg>
                    <span>Googleアカウントでログイン & Classroom同期</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Email / Password */}
          {activeTab === 'email' && (
            <div className="animate-in fade-in">
              {/* Sub-mode switch: Login vs Register */}
              <div className="flex items-center justify-center gap-4 mb-4 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode('login');
                    setIsResetMode(false);
                    setErrorMessage(null);
                  }}
                  className={`text-xs font-bold pb-1 transition border-b-2 ${
                    emailMode === 'login' && !isResetMode
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1" />
                  ログイン
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode('register');
                    setIsResetMode(false);
                    setErrorMessage(null);
                  }}
                  className={`text-xs font-bold pb-1 transition border-b-2 ${
                    emailMode === 'register' && !isResetMode
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                  新規アカウント登録
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {/* Email / ID field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    メールアドレス または 生徒ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={emailOrId}
                      onChange={e => setEmailOrId(e.target.value)}
                      placeholder={emailMode === 'login' ? "例: student01 または sample@example.com" : "半角英数ID または メールアドレス"}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Registration fields */}
                {emailMode === 'register' && !isResetMode && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        お名前（ニックネーム可）
                      </label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="例: 佐藤 翔太"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">学年・区分</label>
                        <select
                          value={grade}
                          onChange={e => setGrade(e.target.value)}
                          className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        >
                          <option value="高校1年生">高校1年生</option>
                          <option value="高校2年生">高校2年生</option>
                          <option value="高校3年生">高校3年生</option>
                          <option value="中学1年生">中学1年生</option>
                          <option value="中学2年生">中学2年生</option>
                          <option value="中学3年生">中学3年生</option>
                          <option value="受験生・浪人生">受験生・浪人生</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">学習目標</label>
                        <input
                          type="text"
                          value={targetGoal}
                          onChange={e => setTargetGoal(e.target.value)}
                          placeholder="例: 定期考査85点"
                          className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password field (hidden in reset mode) */}
                {!isResetMode && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        パスワード
                        {emailMode === 'register' && <span className="text-slate-400 font-normal ml-1">（6文字以上）</span>}
                      </label>
                      {emailMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setIsResetMode(true)}
                          className="text-[11px] text-orange-600 hover:underline"
                        >
                          パスワードをお忘れの場合
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Back button from reset mode */}
                {isResetMode && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsResetMode(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      ログイン画面に戻る
                    </button>
                  </div>
                )}

                {/* Classroom Simultaneous Sync Indicator */}
                <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 text-[11px] text-orange-950 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-orange-600 text-white flex items-center justify-center shrink-0">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="flex-1 leading-tight">
                    <span className="font-bold">Firebase & Classroom 同時同期</span>
                    <span className="text-orange-700 ml-1">（ログインと同時に最新課題・範囲を反映）</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isResetMode ? (
                    '再設定メールを送信'
                  ) : emailMode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Firebaseでログイン & 同期
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      アカウント登録 & Firebase同期
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo ID helper button */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-800 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  お試しデモIDをワンクリック入力
                </button>

                <span className="text-[10px] text-slate-400">
                  {currentUserName ? `現在: ${currentUserName}` : ''}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: Anonymous Guest Login */}
          {activeTab === 'guest' && (
            <div className="space-y-4 py-2 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  登録不要・ワンタップでFirebaseゲスト体験
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Firebase Authentication の匿名認証（Anonymous Auth）を使って、メールアドレスやパスワードの入力なしで即座に専用の学習スペースとUIDをプロビジョニングします。
                </p>
              </div>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>ゲストとして今すぐ始める（ワンクリック）</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

