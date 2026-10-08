import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Bot, 
  TrendingUp, 
  Users, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronDown,
  LayoutDashboard,
  Flame,
  Settings,
  X,
  GraduationCap,
  Trash2,
  Sparkles,
  Plus,
  KeyRound,
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onAddStudyMinutes: (minutes: number) => void;
  onOpenOnboarding: () => void;
  onOpenAIAssistant: () => void;
  onOpenManualTimeModal?: () => void;
  onOpenAuthModal?: () => void;
  pendingDeadlinesCount: number;
  classroomPendingCount?: number;
  isClassroomConnected?: boolean;
  onSyncClassroom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({
  currentTab,
  setCurrentTab,
  currentUser,
  allUsers,
  onSelectUser,
  onAddStudyMinutes,
  onOpenOnboarding,
  onOpenAIAssistant,
  onOpenManualTimeModal,
  onOpenAuthModal,
  pendingDeadlinesCount,
  classroomPendingCount = 0,
  isClassroomConnected = false,
  onSyncClassroom
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const mobileTabsRef = useRef<HTMLDivElement | null>(null);
  
  // Timer State (Stopwatch/Pomodoro)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Auto-scroll active tab on mobile/tablet upper navigation bar
  useEffect(() => {
    if (mobileTabsRef.current) {
      const activeEl = mobileTabsRef.current.querySelector<HTMLElement>(`#mobile-top-tab-${currentTab}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentTab]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStopAndSaveTimer = () => {
    if (timerSeconds >= 10) {
      const minutes = Math.round(timerSeconds / 60) || 1;
      onAddStudyMinutes(minutes);
    }
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setIsTimerOpen(false);
  };

  const formatTimerDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}時間${mins > 0 ? `${mins}分` : ''}`;
  };

  // The 5 canonical tabs strictly requested by user:
  // 1. ホーム 2. テスト範囲 3. 学習計画 4. 成績 5. AIアシスタント
  const mainNavItems = [
    { id: 'home', label: 'ホーム', icon: LayoutDashboard },
    { id: 'scope', label: 'テスト範囲', icon: BookOpen },
    { 
      id: 'plan', 
      label: '学習計画', 
      icon: Calendar, 
      badge: pendingDeadlinesCount > 0 ? pendingDeadlinesCount : undefined 
    },
    { 
      id: 'classroom', 
      label: 'Classroom', 
      icon: GraduationCap, 
      badge: classroomPendingCount > 0 ? classroomPendingCount : undefined 
    },
    { id: 'analytics', label: '成績', icon: TrendingUp },
    { id: 'ai-assistant', label: 'AIアシスタント', icon: Bot },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo & Concept Name */}
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <button 
                onClick={() => setCurrentTab('home')} 
                className="flex items-center gap-2 lg:gap-2.5 text-left group focus:outline-none shrink-0"
                id="btn-nav-home"
              >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition shrink-0">
                  <BookOpen className="w-5 h-5 shrink-0" />
                </div>
                <div className="shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-base lg:text-lg tracking-tight whitespace-nowrap">
                      NaviStudy
                    </span>
                    <span className="text-[10px] px-2 py-0.5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline-block whitespace-nowrap">
                      学習ナビゲーション
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 hidden xl:block leading-tight whitespace-nowrap">
                    テスト前の迷子をなくすアプリ
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation: 6 Canonical Tabs (PC・デスクトップ用：改行防止・1行整列) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shrink-0 max-w-full overflow-x-auto scrollbar-none">
              {mainNavItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      if (item.id === 'ai-assistant') {
                        onOpenAIAssistant();
                      }
                      setCurrentTab(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-bold transition relative whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Tools & Settings Menu (友達機能や設定をまとめて画面をすっきり整理) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Study Stopwatch / Timer & Manual Addition */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={() => setIsTimerOpen(!isTimerOpen)}
                  id="btn-nav-timer"
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 whitespace-nowrap ${
                    isTimerRunning
                      ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="学習タイマーを起動"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-mono font-bold whitespace-nowrap text-xs">
                    {isTimerRunning ? formatTimerDisplay(timerSeconds) : 'タイマー'}
                  </span>
                </button>

                {onOpenManualTimeModal && (
                  <button
                    onClick={onOpenManualTimeModal}
                    id="btn-nav-manual-time"
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition shadow-2xs shrink-0 whitespace-nowrap"
                    title="塾などタイマーを使わなかった時間を追加"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">塾・時間追加</span>
                    <span className="sm:hidden whitespace-nowrap">+時間</span>
                  </button>
                )}
              </div>

              {/* Points Badge */}
              <button
                onClick={() => setCurrentTab('friend-battle')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-xs hover:opacity-90 transition shrink-0 whitespace-nowrap"
                title="学習ポイント＆ランキングを見る"
                id="btn-nav-points"
              >
                <span>⭐</span>
                <span className="font-mono">{currentUser.weeklyPoints || 850}</span>
                <span className="text-[10px] opacity-90 font-normal">pt</span>
              </button>

              {/* Study Streak & Total Badge */}
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs shrink-0 whitespace-nowrap">
                <span className="flex items-center gap-1 font-bold text-amber-600 whitespace-nowrap">
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  {currentUser.streakDays}日連続
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-mono font-medium whitespace-nowrap">
                  計 {formatTotalTime(currentUser.totalStudyMinutes)}
                </span>
              </div>

              {/* Firebase Login Button */}
              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  id="btn-nav-auth"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition shrink-0 whitespace-nowrap shadow-2xs"
                  title="Firebaseでログイン・アカウント登録・Classroom同期"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="whitespace-nowrap">Firebaseログイン</span>
                </button>
              )}

              {/* Right Settings / Menu Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  id="btn-nav-menu"
                  className="flex items-center gap-1 p-1 sm:p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition shrink-0"
                  aria-label="メニューを開く"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500">{currentUser.roleTitle}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <span>⭐ {currentUser.weeklyPoints || 850} pt</span>
                        <span>•</span>
                        <span>{currentUser.rankLeague || 'ゴールド'}リーグ</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {onOpenAuthModal && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-amber-900 hover:bg-amber-50 flex items-center gap-2 font-bold border-b border-slate-100"
                          id="btn-menu-auth-modal"
                        >
                          <Flame className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                          <span>Firebaseでログイン / 登録</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCurrentTab('classroom');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        id="btn-menu-classroom"
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-emerald-600" />
                          Google Classroom 連携
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          isClassroomConnected 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isClassroomConnected ? '連携中' : '未連携'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab('friend-battle');
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        id="btn-menu-friend-battle"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-600" />
                          ポイント＆ランキングバトル
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                          {currentUser.weeklyPoints || 850}pt
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenOnboarding();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        初回設定 / 学年・目標変更
                      </button>

                      {onOpenManualTimeModal && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenManualTimeModal();
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-medium"
                          id="btn-menu-manual-time"
                        >
                          <Clock className="w-4 h-4 text-blue-600" />
                          塾・オフライン学習の時間を追加
                        </button>
                      )}

                      {onSyncClassroom && (
                        <button
                          onClick={() => {
                            onSyncClassroom();
                            setIsMenuOpen(false);
                            setCurrentTab('classroom');
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                          id="btn-menu-sync-classroom"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Classroom最新課題を取り込む
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 px-3 pb-1">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">
                        モデルアカウント切替
                      </div>
                      <div className="space-y-1">
                        {allUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                              u.id === currentUser.id 
                                ? 'bg-blue-50 text-blue-700 font-bold' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate">{u.name} ({u.roleTitle.split(' ')[0]})</span>
                            {u.id === currentUser.id && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Smartphone Horizontal Scrollable Upper Navigation (上側の目次) */}
        <div 
          ref={mobileTabsRef}
          className="md:hidden border-t border-slate-200/80 bg-slate-50/95 backdrop-blur px-2.5 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 shadow-2xs"
          aria-label="上側目次・ナビゲーション"
        >
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-top-tab-${item.id}`}
                onClick={() => {
                  if (item.id === 'ai-assistant') {
                    onOpenAIAssistant();
                  }
                  setCurrentTab(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 active:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Timer Floating Widget (When open) */}
      {isTimerOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>集中学習タイマー</span>
            </div>
            <button
              onClick={() => setIsTimerOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2">
            <div className="text-4xl font-black font-mono text-slate-900 tracking-wider">
              {formatTimerDisplay(timerSeconds)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ストップウォッチで学習時間を記録
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4" /> 一時停止
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> 計測スタート
                </>
              )}
            </button>
            <button
              onClick={handleStopAndSaveTimer}
              disabled={timerSeconds === 0}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition"
              title="記録して保存"
            >
              記録
            </button>
          </div>

          {onOpenManualTimeModal && (
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsTimerOpen(false);
                  onOpenManualTimeModal();
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1.5 w-full py-1 hover:bg-blue-50 rounded-lg transition"
                id="btn-timer-open-manual-modal"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>塾などタイマーなしの時間を手動追加</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (5 Strictly Curated Tabs) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'ai-assistant') {
                  onOpenAIAssistant();
                }
                setCurrentTab(item.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-center relative whitespace-nowrap shrink-0 ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="text-[10px] font-bold whitespace-nowrap leading-tight">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute top-0 right-1/4 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
});
