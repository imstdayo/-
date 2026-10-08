import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Sparkles, 
  Camera, 
  Users, 
  Bot, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  TrendingUp, 
  Target, 
  Plus, 
  Check, 
  Play, 
  ChevronRight,
  Trophy,
  Award,
  GraduationCap,
  Zap,
  KeyRound
} from 'lucide-react';
import { TestScope, SubmissionDeadline, UserProfile, DailyStudyTask, DailyBonusMission } from '../types';
import { DailyBonusCard } from './DailyBonusCard';

interface DashboardOverviewProps {
  testScope: TestScope;
  deadlines: SubmissionDeadline[];
  currentUser: UserProfile;
  dailyTasks?: DailyStudyTask[];
  dailyBonusMissions?: DailyBonusMission[];
  onCompleteDailyBonus?: (missionId: string, rewardPoints: number) => void;
  onToggleDailyTask?: (taskId: string) => void;
  onAddDailyTask?: (task: Omit<DailyStudyTask, 'id' | 'completed'>) => void;
  onNavigateTab: (tab: string) => void;
  onToggleDeadline: (deadlineId: string) => void;
  onOpenCameraModal: () => void;
  onOpenAIAssistant: () => void;
  onOpenTimer?: () => void;
  onOpenManualTimeModal?: () => void;
  onOpenAuthModal?: () => void;
  classroomPendingCount?: number;
  isClassroomConnected?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = React.memo(({
  testScope,
  deadlines,
  currentUser,
  dailyTasks = [],
  dailyBonusMissions = [],
  onCompleteDailyBonus = () => {},
  onToggleDailyTask,
  onAddDailyTask,
  onNavigateTab,
  onToggleDeadline,
  onOpenCameraModal,
  onOpenAIAssistant,
  onOpenTimer,
  onOpenManualTimeModal,
  onOpenAuthModal,
  classroomPendingCount = 0,
  isClassroomConnected = false
}) => {
  // Calculate remaining days safely
  const today = new Date();
  const testStart = testScope.startDate ? new Date(testScope.startDate) : null;
  const daysRemaining = testStart && !isNaN(testStart.getTime())
    ? Math.max(0, Math.ceil((testStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Calculate total items & completed items across all subjects
  let totalItems = 0;
  let completedItems = 0;
  testScope.subjects.forEach(sub => {
    sub.items.forEach(item => {
      totalItems++;
      if (item.completed) completedItems++;
    });
  });
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Format total study time
  const totalHours = Math.floor(currentUser.totalStudyMinutes / 60);
  const totalMins = currentUser.totalStudyMinutes % 60;

  // Pending deadlines
  const pendingDeadlines = deadlines.filter(d => !d.completed);
  const urgentDeadlines = pendingDeadlines
    .map(d => {
      const dDate = new Date(d.dueDate);
      const daysLeft = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...d, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Total AI estimated study hours
  const totalAIHours = testScope.subjects.reduce((sum, s) => sum + (s.aiEstimatedHours || 8.0), 0);

  return (
    <div className="space-y-6">
      {/* 1. ヒーローバナー：挨拶、テスト名、4つの主要メトリクス（総合勉強時間、日数、ストリーク、進捗） */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-36 -top-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold text-white">
                {currentUser.roleTitle}
              </span>
              <span className="text-xs text-blue-100 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-300" /> 目標: {currentUser.targetGoal}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.name.includes('さんの学習ダッシュボード')
                ? currentUser.name
                : `${currentUser.name} さんの学習ダッシュボード`}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              {testScope.subjects.length > 0
                ? <>次回の「<span className="font-bold text-white">{testScope.title}</span>」に向けて、テスト範囲と提出物を整理しましょう！</>
                : 'Google Classroomの投稿をAI認識して、テスト範囲・提出物・今日のタスクを全自動で適用できます。'}
            </p>
          </div>

          {/* 右上のアクションボタン群 */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md whitespace-nowrap shrink-0 border border-amber-200/50"
                id="btn-dash-auth-header"
                title="Firebaseでログイン・Classroomと同時に同期"
              >
                <Flame className="w-4 h-4 text-amber-950 fill-amber-950 shrink-0" />
                <span className="whitespace-nowrap">Firebaseログイン</span>
              </button>
            )}
            {onOpenManualTimeModal && (
              <button
                onClick={onOpenManualTimeModal}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 backdrop-blur text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-amber-300/40 whitespace-nowrap shrink-0"
                id="btn-dash-add-time-header"
                title="塾などタイマーを使わなかった勉強時間を手動追加"
              >
                <Clock className="w-4 h-4 text-amber-100 shrink-0" />
                <span className="whitespace-nowrap">塾・時間を追加</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('classroom')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 backdrop-blur text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-emerald-300/40 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-100 shrink-0" /> <span className="whitespace-nowrap">Classroom AI同期</span>
            </button>
            <button
              onClick={onOpenAIAssistant}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 whitespace-nowrap shrink-0"
            >
              <Bot className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">AIに相談</span>
            </button>
            <button
              onClick={onOpenCameraModal}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 whitespace-nowrap shrink-0"
            >
              <Camera className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">答案分析</span>
            </button>
          </div>
        </div>

        {/* 4つの主要メトリクスカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/15">
          {/* ① テストまでの残り日数 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
              <span>テストまで</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              {daysRemaining}
              <span className="text-sm font-normal text-white ml-0.5">日</span>
            </div>
            <span className="text-[10px] text-blue-100 mt-0.5 block truncate">
              {testScope.startDate ? `${testScope.startDate} 開始` : '日付未設定'}
            </span>
          </div>

          {/* ② 総合勉強時間 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
                <span>総合勉強時間</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                {totalHours}
                <span className="text-sm font-normal text-blue-100 mx-0.5">h</span>
                {totalMins}
                <span className="text-sm font-normal text-blue-100 ml-0.5">m</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between gap-1">
              <span className="text-[10px] text-blue-100 truncate">
                本日 {currentUser.todayStudyMinutes}分 完了
              </span>
              {onOpenManualTimeModal && (
                <button
                  onClick={onOpenManualTimeModal}
                  className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                  title="塾などでタイマーが使えなかった勉強時間を追加"
                  id="btn-dash-metric-add-time"
                >
                  <Plus className="w-3 h-3" />
                  <span>時間追加</span>
                </button>
              )}
            </div>
          </div>

          {/* ③ 連続学習日数（ストリーク） */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
              <span>学習ストリーク</span>
              <Flame className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 flex items-center gap-1">
              <span>{currentUser.streakDays}</span>
              <span className="text-sm font-normal text-white">日連続</span>
            </div>
            <span className="text-[10px] text-blue-100 mt-0.5 block">
              継続ボーナス加算中！🔥
            </span>
          </div>

          {/* ④ 獲得ポイント ＆ ランキング */}
          <div 
            onClick={() => onNavigateTab('friend-battle')}
            className="bg-white/10 hover:bg-white/15 cursor-pointer backdrop-blur rounded-2xl p-4 border border-white/10 transition group"
            title="ランキング・ポイント詳細を見る"
          >
            <div className="flex items-center justify-between text-blue-100 text-xs mb-1">
              <span>学習ポイント (週/累計)</span>
              <Trophy className="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-yellow-300">
              {currentUser.weeklyPoints || 850}
              <span className="text-sm font-normal text-white ml-0.5">pt</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-blue-100 mt-0.5">
              <span>{currentUser.rankLeague || 'ゴールド'}リーグ</span>
              <span className="text-amber-200 underline font-semibold">ランキングへ →</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. デイリーボーナス（苦手や忘れてそうなところを今日はこれを何分してみよう！） */}
      {dailyBonusMissions.length > 0 && (
        <DailyBonusCard
          missions={dailyBonusMissions}
          onCompleteMission={onCompleteDailyBonus}
          onOpenTimer={onOpenTimer}
        />
      )}

      {/* 3. 教科別テスト範囲＆進捗カードグリッド（各教科の進捗を一望） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              教科別テスト範囲と学習状況
            </h2>
            <p className="text-xs text-slate-500">
              教科ごとの進捗率・目標点・指定ページを一目でチェック
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('scope')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            テスト範囲を詳しく整理 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 各教科のカード一覧 */}
        {testScope.subjects.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">テスト範囲データは現在ゼロ（未登録）です</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Google Classroomの投稿や課題をAIで解析すると、全教科のテスト範囲・指定ページ・チェックリストがここに自動表示されます。
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => onNavigateTab('classroom')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Google ClassroomでAI解析して適用する →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {testScope.subjects.map(subject => {
              const total = subject.items.length;
              const completed = subject.items.filter(i => i.completed).length;
              const subProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
              const shakyCount = subject.items.filter(i => i.masteryLevel === 'shaky').length;

              return (
                <div
                  key={subject.id}
                  onClick={() => onNavigateTab('scope')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50 hover:bg-white cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                          {subject.name}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        目標 {subject.targetScore}点
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div className="truncate">
                        <span className="text-slate-400">教科書:</span> {subject.textbookRange}
                      </div>
                      <div className="truncate">
                        <span className="text-slate-400">ワーク:</span> {subject.workbookRange}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar and metrics */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className="text-slate-500 text-[11px]">
                        {completed}/{total} 単元
                      </span>
                      <span className="font-bold text-slate-900">
                        {subProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${subProgress}%`,
                          backgroundColor: subject.color
                        }}
                      />
                    </div>
                    {shakyCount > 0 && (
                      <span className="text-[10px] text-rose-600 font-bold mt-1 block">
                        ⚠ 要注意・苦手単元: {shakyCount}件
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. 2カラム：未提出課題（期限アラート） ＆ AI学習推定時間・目標逆算 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 提出期限アラート (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    提出期限チェックリスト
                  </h3>
                  <p className="text-xs text-slate-500">
                    提出期限が近い課題・ワークの提出漏れを防止
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('plan')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                カレンダーで確認 →
              </button>
            </div>

            {/* List of pending deadlines */}
            <div className="mt-3 space-y-2.5">
              {urgentDeadlines.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  未提出の課題はありません！
                </div>
              ) : (
                urgentDeadlines.slice(0, 4).map(deadline => {
                  const isVeryUrgent = deadline.daysLeft <= 2;
                  const isUrgent = deadline.daysLeft <= 5;

                  return (
                    <div
                      key={deadline.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isVeryUrgent
                          ? 'bg-rose-50/70 border-rose-200'
                          : isUrgent
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={deadline.completed}
                          onChange={() => onToggleDeadline(deadline.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span>{deadline.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-amber-100 text-amber-800">
                              +50pt
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {deadline.subjectName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                          isVeryUrgent
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isUrgent
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {deadline.daysLeft < 0 
                            ? '期限超過' 
                            : deadline.daysLeft === 0 
                            ? '今日締切' 
                            : `あと${deadline.daysLeft}日`}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {deadline.dueDate}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>残り未提出: {pendingDeadlines.length} 件</span>
            <button
              onClick={() => onNavigateTab('plan')}
              className="text-blue-600 hover:underline font-semibold"
            >
              ＋ 新しい提出物を登録
            </button>
          </div>

          {/* Google Classroom Sync Banner */}
          <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>Google Classroom 連携</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                    {isClassroomConnected ? '接続中' : '利用可能'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {classroomPendingCount > 0 
                    ? `Classroomに未完了の課題が ${classroomPendingCount} 件あります` 
                    : '授業課題や提出期限を1タップで同期'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('classroom')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0 shadow-2xs"
              id="btn-dash-open-classroom"
            >
              Classroomを開く →
            </button>
          </div>
        </div>

        {/* Right: AIによる目標逆算・推定学習時間サマリー (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    AI推定学習時間
                  </h3>
                  <p className="text-xs text-slate-500">
                    目標点数からAIが算出した必要時間
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('plan')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                計画を立てる →
              </button>
            </div>

            {/* Total hours overview */}
            <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 font-bold block">
                  目標点までに必要な総学習時間
                </span>
                <div className="text-2xl font-black text-indigo-950 font-mono">
                  約 {totalAIHours.toFixed(1)} <span className="text-sm font-normal">時間</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">1日あたりの目安</span>
                <span className="text-sm font-bold text-indigo-700 font-mono">
                  約 {(totalAIHours / Math.max(1, daysRemaining)).toFixed(1)} 時間/日
                </span>
              </div>
            </div>

            {/* Subjects breakdown list */}
            <div className="mt-3 space-y-2">
              {testScope.subjects.slice(0, 4).map(sub => {
                const hours = sub.aiEstimatedHours || 8.0;
                const h = Math.floor(hours);
                const m = Math.round((hours - h) * 60);

                return (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span>{sub.name}</span>
                    </div>
                    <div className="font-mono">
                      <span className="font-bold text-indigo-700">あと {h}時間{m > 0 ? `${m}分` : ''}</span>
                      <span className="text-slate-400 text-[10px] ml-2">目標 {sub.targetScore}点</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              レーダーチャート・苦手分析を見る
            </button>
          </div>
        </div>
      </div>

      {/* 4. 下部ナビゲーションカード（クイックジャンプ） */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('scope')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-2xs text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">テスト範囲整理</div>
          <p className="text-[11px] text-slate-500 mt-0.5">写真撮影＆AI自動整理</p>
        </button>

        <button
          onClick={() => onNavigateTab('plan')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-2xs text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">学習計画カレンダー</div>
          <p className="text-[11px] text-slate-500 mt-0.5">日別タスク・必要時間</p>
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-2xs text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">成績・苦手分析</div>
          <p className="text-[11px] text-slate-500 mt-0.5">レーダーチャート・答案診断</p>
        </button>

        <button
          onClick={() => onNavigateTab('friend-battle')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-2xs text-left transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">フレンド時間競争</div>
          <p className="text-[11px] text-slate-500 mt-0.5">仲間と勉強時間を競う</p>
        </button>
      </div>
    </div>
  );
});
