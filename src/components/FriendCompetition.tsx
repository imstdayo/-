import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Flame, 
  Clock, 
  Send, 
  Plus, 
  UserCheck, 
  Award, 
  Sparkles,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Zap,
  TrendingUp,
  Target,
  Medal,
  ChevronRight
} from 'lucide-react';
import { FriendRank, UserProfile } from '../types';

interface FriendCompetitionProps {
  currentUser: UserProfile;
  friends: FriendRank[];
  onToggleCompetition: () => void;
  onAddFriend: (name: string, weeklyMinutes: number, status: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const FriendCompetition: React.FC<FriendCompetitionProps> = ({
  currentUser,
  friends,
  onToggleCompetition,
  onAddFriend,
  onNavigateTab
}) => {
  const [rankingMode, setRankingMode] = useState<'points' | 'time'>('points');
  const [pointTimeSpan, setPointTimeSpan] = useState<'weekly' | 'total'>('weekly');
  const [stampNotice, setStampNotice] = useState<string | null>(null);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendStatus, setNewFriendStatus] = useState('📖 デイリーボーナス達成＆提出物ワーク解き直し中');

  // Ensure current user's values reflect in friends list
  const enrichedFriends = friends.map(f => {
    if (f.isCurrentUser) {
      return {
        ...f,
        weeklyMinutes: currentUser.todayStudyMinutes > 0 ? (f.weeklyMinutes || 600) : (f.weeklyMinutes || 0),
        streakDays: currentUser.streakDays,
        weeklyPoints: currentUser.weeklyPoints || 850,
        totalPoints: currentUser.totalPoints || 1680,
        rankLeague: currentUser.rankLeague || 'ゴールド',
        pointsBreakdown: f.pointsBreakdown || {
          tasks: 240,
          studyTime: 340,
          dailyBonus: 150,
          streakBonus: 120
        }
      };
    }
    return f;
  });

  // Sort friends by selected mode
  const sortedFriends = [...enrichedFriends].sort((a, b) => {
    if (rankingMode === 'points') {
      const aVal = pointTimeSpan === 'weekly' ? (a.weeklyPoints || 0) : (a.totalPoints || 0);
      const bVal = pointTimeSpan === 'weekly' ? (b.weeklyPoints || 0) : (b.totalPoints || 0);
      return bVal - aVal;
    }
    return b.weeklyMinutes - a.weeklyMinutes;
  });

  const myIndex = sortedFriends.findIndex(f => f.isCurrentUser);
  const myRank = myIndex >= 0 ? myIndex + 1 : 1;
  const me = sortedFriends[myIndex] || sortedFriends[0];

  // Rival ahead
  const rivalAhead = myIndex > 0 ? sortedFriends[myIndex - 1] : null;
  const pointsToNextRank = rivalAhead 
    ? ((pointTimeSpan === 'weekly' ? rivalAhead.weeklyPoints : rivalAhead.totalPoints) || 0) - 
      ((pointTimeSpan === 'weekly' ? me?.weeklyPoints : me?.totalPoints) || 0) + 10
    : 0;

  const handleSendCheer = (friendName: string, stampText: string) => {
    import('canvas-confetti').then(m => {
      const fire: any = m.default || m;
      if (typeof fire === 'function') {
        fire({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }).catch(() => {});
    setStampNotice(`${friendName}さんに「${stampText}」スタンプを送信しました！🔥`);
    setTimeout(() => setStampNotice(null), 3000);
  };

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    onAddFriend(
      newFriendName.trim(),
      Math.floor(Math.random() * 300) + 400,
      newFriendStatus.trim() || '集中して学習ポイント蓄積中！'
    );
    setIsAddFriendModalOpen(false);
    setNewFriendName('');
  };

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}時間${m > 0 ? `${m}分` : ''}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Banner: Points, League, & Competition Toggle */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Background glow decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 backdrop-blur">
                  {currentUser.rankLeague || 'ゴールド'}リーグ
                </span>
                <span className="text-xs text-amber-100 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-300" /> 学習ポイント＆時間バトル
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                学習ポイント ランキングバトル
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
                課題の終了、勉強時間、デイリーボーナス（苦手・忘却曲線克服）、連続学習でポイントが貯まります！仲間と競い合ってモチベーションUP！
              </p>
            </div>

            {/* Competition Mode Toggle */}
            <div className="flex items-center gap-3 shrink-0 bg-black/20 p-3 rounded-2xl backdrop-blur border border-white/15">
              <div className="text-right">
                <span className="text-xs font-black block text-white">
                  競争モード: {currentUser.competitionEnabled ? 'ON (公開中)' : 'OFF (非公開)'}
                </span>
                <span className="text-[10px] text-amber-200">設定からいつでも変更可</span>
              </div>
              <button
                onClick={onToggleCompetition}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                  currentUser.competitionEnabled ? 'bg-yellow-400' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md block transition-transform transform ${
                    currentUser.competitionEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* User's Current Point Stats in Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/20">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <span className="text-[11px] text-amber-100 font-semibold block">現在の順位</span>
              <div className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono mt-0.5">
                第 {myRank} 位
              </div>
              {rivalAhead && (
                <span className="text-[10px] text-amber-200 block truncate mt-0.5">
                  あと {pointsToNextRank} pt で第 {myRank - 1} 位！
                </span>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <span className="text-[11px] text-amber-100 font-semibold block">今週の獲得ポイント</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                {currentUser.weeklyPoints || 850}
                <span className="text-sm font-normal text-amber-200 ml-1">pt</span>
              </div>
              <span className="text-[10px] text-amber-200 block truncate mt-0.5">
                累計 {currentUser.totalPoints || 1680} pt
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <span className="text-[11px] text-amber-100 font-semibold block">連続勉強日数（ストリーク）</span>
              <div className="text-2xl sm:text-3xl font-black text-yellow-300 font-mono mt-0.5 flex items-center gap-1">
                <Flame className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                <span>{currentUser.streakDays}</span>
                <span className="text-sm font-normal text-white">日連続</span>
              </div>
              <span className="text-[10px] text-amber-200 block truncate mt-0.5">
                ストリークボーナス +120pt 適用中
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <span className="text-[11px] text-amber-100 font-semibold block">週間総勉強時間</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                {formatHours(me?.weeklyMinutes || 680)}
              </div>
              <span className="text-[10px] text-amber-200 block truncate mt-0.5">
                1分＝1pt 加算中
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Point Rules & Earn Breakdown Explainer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              ポイント獲得ルール（どうやって貯める？）
            </h3>
            <p className="text-xs text-slate-500">
              日々の勉強の努力がすべてポイントになり、ランキングに即時反映されます
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>課題・タスクの完了</span>
            </div>
            <div className="text-lg font-black text-amber-950 font-mono mt-1">
              +40〜50 <span className="text-xs font-normal">pt</span>
            </div>
            <span className="text-[10px] text-amber-800">
              提出物完了 +50pt / 今日のタスク +40pt
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60">
            <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>勉強時間 (タイマー/塾)</span>
            </div>
            <div className="text-lg font-black text-blue-950 font-mono mt-1">
              1分 = 1 <span className="text-xs font-normal">pt</span>
            </div>
            <span className="text-[10px] text-blue-800">
              タイマー記録や手動追加で自動加算
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-900">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>AIデイリーボーナス</span>
            </div>
            <div className="text-lg font-black text-rose-950 font-mono mt-1">
              +120〜150 <span className="text-xs font-normal">pt</span>
            </div>
            <span className="text-[10px] text-rose-800">
              苦手・忘却曲線克服ミッション達成で大量獲得
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span>連続勉強日数 (継続)</span>
            </div>
            <div className="text-lg font-black text-emerald-950 font-mono mt-1">
              +50〜300 <span className="text-xs font-normal">pt</span>
            </div>
            <span className="text-[10px] text-emerald-800">
              ストリーク継続日数に応じたボーナス加算
            </span>
          </div>
        </div>
      </div>

      {/* Cheering Notice */}
      {stampNotice && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{stampNotice}</span>
        </div>
      )}

      {/* 3. Leaderboard Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {rankingMode === 'points' ? '学習ポイント ランキング' : '週間勉強時間 ランキング'}
            </h2>
            <p className="text-xs text-slate-500">
              リアルタイム更新 • ライバルとポイントを競い合おう
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Mode Switch: Points vs Time */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setRankingMode('points')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  rankingMode === 'points'
                    ? 'bg-white text-amber-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                id="btn-rank-mode-points"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>ポイントで競う</span>
              </button>
              <button
                onClick={() => setRankingMode('time')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  rankingMode === 'time'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                id="btn-rank-mode-time"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>勉強時間で競う</span>
              </button>
            </div>

            {/* Time Span if Points */}
            {rankingMode === 'points' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPointTimeSpan('weekly')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    pointTimeSpan === 'weekly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  今週
                </button>
                <button
                  onClick={() => setPointTimeSpan('total')}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    pointTimeSpan === 'total' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  累計
                </button>
              </div>
            )}

            <button
              onClick={() => setIsAddFriendModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> フレンドを追加
            </button>
          </div>
        </div>

        {/* Podium Top 3 Presentation */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 py-2">
          {/* 2nd Place */}
          {sortedFriends[1] && (
            <div className="bg-slate-50/80 rounded-2xl p-3 sm:p-4 border border-slate-200 text-center flex flex-col justify-end items-center relative">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center absolute -top-2.5 shadow-xs">
                🥈
              </div>
              <img
                src={sortedFriends[1].avatar}
                alt={sortedFriends[1].name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-slate-300 mb-2"
              />
              <div className="font-extrabold text-xs text-slate-900 truncate max-w-full">
                {sortedFriends[1].name.split(' ')[0]}
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-slate-800 mt-0.5">
                {rankingMode === 'points' 
                  ? `${pointTimeSpan === 'weekly' ? sortedFriends[1].weeklyPoints : sortedFriends[1].totalPoints} pt`
                  : formatHours(sortedFriends[1].weeklyMinutes)}
              </div>
              <span className="text-[10px] text-slate-400">第 2 位</span>
            </div>
          )}

          {/* 1st Place */}
          {sortedFriends[0] && (
            <div className="bg-amber-50/90 rounded-2xl p-3 sm:p-5 border-2 border-amber-300 text-center flex flex-col justify-end items-center relative shadow-xs">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center absolute -top-3 shadow-md">
                👑
              </div>
              <img
                src={sortedFriends[0].avatar}
                alt={sortedFriends[0].name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-400 mb-2 shadow-xs"
              />
              <div className="font-extrabold text-xs sm:text-sm text-amber-950 truncate max-w-full">
                {sortedFriends[0].name.split(' ')[0]}
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-amber-600 mt-0.5">
                {rankingMode === 'points' 
                  ? `${pointTimeSpan === 'weekly' ? sortedFriends[0].weeklyPoints : sortedFriends[0].totalPoints} pt`
                  : formatHours(sortedFriends[0].weeklyMinutes)}
              </div>
              <span className="text-[10px] font-bold text-amber-800">チャンピオン 🥇</span>
            </div>
          )}

          {/* 3rd Place */}
          {sortedFriends[2] && (
            <div className="bg-amber-700/5 rounded-2xl p-3 sm:p-4 border border-amber-800/20 text-center flex flex-col justify-end items-center relative">
              <div className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center absolute -top-2.5 shadow-xs">
                🥉
              </div>
              <img
                src={sortedFriends[2].avatar}
                alt={sortedFriends[2].name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-700/40 mb-2"
              />
              <div className="font-extrabold text-xs text-slate-900 truncate max-w-full">
                {sortedFriends[2].name.split(' ')[0]}
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-amber-900 mt-0.5">
                {rankingMode === 'points' 
                  ? `${pointTimeSpan === 'weekly' ? sortedFriends[2].weeklyPoints : sortedFriends[2].totalPoints} pt`
                  : formatHours(sortedFriends[2].weeklyMinutes)}
              </div>
              <span className="text-[10px] text-slate-400">第 3 位</span>
            </div>
          )}
        </div>

        {/* List of ranks */}
        <div className="space-y-2.5 pt-2">
          {sortedFriends.map((friend, index) => {
            const rank = index + 1;
            const isMe = friend.isCurrentUser;
            const pointsVal = pointTimeSpan === 'weekly' ? friend.weeklyPoints : friend.totalPoints;

            return (
              <div
                key={friend.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Rank badge, Avatar, Name & Status */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl font-black flex items-center justify-center shrink-0 font-mono text-xs ${
                    rank === 1 ? 'bg-amber-400 text-amber-950 shadow-sm' :
                    rank === 2 ? 'bg-slate-200 text-slate-800' :
                    rank === 3 ? 'bg-amber-700/20 text-amber-900' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>

                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-black truncate ${isMe ? 'text-amber-950' : 'text-slate-900'}`}>
                        {friend.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500 text-white">
                          あなた
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600">
                        {friend.rankLeague || 'シルバー'}
                      </span>
                      <span className="text-[10px] flex items-center gap-0.5 text-amber-600 font-bold">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {friend.streakDays}日連続
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {friend.statusMessage}
                    </p>

                    {/* Point breakdown preview for user */}
                    {friend.pointsBreakdown && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                        <span>課題:{friend.pointsBreakdown.tasks}pt</span>
                        <span>•</span>
                        <span>学習時間:{friend.pointsBreakdown.studyTime}pt</span>
                        <span>•</span>
                        <span>ボーナス:{friend.pointsBreakdown.dailyBonus}pt</span>
                        <span>•</span>
                        <span>継続:{friend.pointsBreakdown.streakBonus}pt</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Score/Points & Cheering Stamps */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {rankingMode === 'points' ? `${pointTimeSpan === 'weekly' ? '週間' : '累計'}獲得ポイント` : '週間学習時間'}
                    </span>
                    <span className="text-base font-black font-mono text-amber-600">
                      {rankingMode === 'points' ? (
                        <>
                          {pointsVal} <span className="text-xs font-normal text-slate-500">pt</span>
                        </>
                      ) : (
                        formatHours(friend.weeklyMinutes)
                      )}
                    </span>
                  </div>

                  {/* Stamp buttons */}
                  {!isMe && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSendCheer(friend.name, 'ナイス集中！🔥')}
                        className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/60 transition"
                        title="応援スタンプを送る"
                      >
                        🔥
                      </button>
                      <button
                        onClick={() => handleSendCheer(friend.name, '一緒に頑張ろう！💪')}
                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200/60 transition"
                        title="一緒に頑張ろうスタンプ"
                      >
                        💪
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Friend Modal */}
      {isAddFriendModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              勉強フレンドを追加
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              友達やライバルを登録して、学習ポイントや勉強時間を競い合いましょう
            </p>

            <form onSubmit={handleCreateFriend} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  フレンド名 (ニックネーム) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例: 佐々木 陸 (高校2年)"
                  value={newFriendName}
                  onChange={e => setNewFriendName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  現在の意気込みステータス
                </label>
                <input
                  type="text"
                  placeholder="例: 🔥 提出課題を終わらせてボーナスポイント狙い！"
                  value={newFriendStatus}
                  onChange={e => setNewFriendStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddFriendModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs"
                >
                  フレンドを追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
