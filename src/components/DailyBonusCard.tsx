import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Award, 
  Flame, 
  Play, 
  RefreshCw, 
  ArrowRight, 
  HelpCircle,
  Zap,
  Target
} from 'lucide-react';
import { DailyBonusMission } from '../types';

interface DailyBonusCardProps {
  missions: DailyBonusMission[];
  onCompleteMission: (missionId: string, rewardPoints: number) => void;
  onOpenTimer?: () => void;
}

export const DailyBonusCard: React.FC<DailyBonusCardProps> = ({
  missions,
  onCompleteMission,
  onOpenTimer
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedAnim, setCompletedAnim] = useState(false);

  if (!missions || missions.length === 0) return null;

  const activeMission = missions[currentIndex % missions.length];
  const allCompleted = missions.every(m => m.completed);

  const handleClaim = () => {
    if (activeMission.completed) return;

    import('canvas-confetti').then(m => {
      const fire: any = m.default || m;
      if (typeof fire === 'function') {
        fire({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }).catch(() => {});

    setCompletedAnim(true);
    setTimeout(() => setCompletedAnim(false), 2000);

    onCompleteMission(activeMission.id, activeMission.rewardPoints);
  };

  const handleNextMission = () => {
    setCurrentIndex(prev => (prev + 1) % missions.length);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
      {/* Decorative Glow circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-extrabold bg-white/20 text-white border border-white/30 backdrop-blur">
                  AI デイリーボーナスミッション
                </span>
                <span className="text-[11px] text-amber-100 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  苦手＆忘却曲線対策
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                苦手や忘れてそうなところを、今日はこれを{activeMission.targetMinutes}分してみよう！
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs px-3 py-1 rounded-full font-black bg-yellow-400 text-slate-950 shadow-xs flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              クリアで +{activeMission.rewardPoints} pt !
            </span>
            {missions.length > 1 && (
              <button
                onClick={handleNextMission}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition flex items-center gap-1 text-[11px] font-semibold"
                title="別の苦手ミッションを見る"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">別の苦手</span>
              </button>
            )}
          </div>
        </div>

        {/* Mission Content Card */}
        <div className={`p-4 sm:p-5 rounded-2xl backdrop-blur transition-all duration-300 border ${
          activeMission.completed 
            ? 'bg-emerald-950/40 border-emerald-300/40' 
            : 'bg-black/20 border-white/20'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/20 text-white">
                  {activeMission.subjectName}
                </span>
                <span className="text-xs text-amber-200 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" /> 目安: {activeMission.targetMinutes}分間
                </span>
                {activeMission.completed && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-400 text-slate-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-slate-950" /> 本日クリア達成！
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {activeMission.title}
              </h3>

              <div className="flex items-start gap-1.5 text-xs text-amber-100/90 leading-relaxed bg-black/15 p-2.5 rounded-xl border border-white/10">
                <Target className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                <span><strong className="text-yellow-200">AI選出の理由:</strong> {activeMission.reason}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
              {activeMission.completed ? (
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs border border-emerald-300/40">
                  <Award className="w-4 h-4 text-yellow-300" />
                  +{activeMission.rewardPoints} pt 獲得済み
                </div>
              ) : (
                <>
                  <button
                    onClick={handleClaim}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-2 transform active:scale-95"
                    id="btn-claim-daily-bonus"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>クリア！+{activeMission.rewardPoints}pt獲得</span>
                  </button>

                  {onOpenTimer && (
                    <button
                      onClick={onOpenTimer}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{activeMission.targetMinutes}分タイマースタート</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Mission list indicator */}
        <div className="flex items-center justify-between text-xs text-amber-100/80 pt-1">
          <div className="flex items-center gap-2">
            <span>本日の苦手候補 ({missions.filter(m => m.completed).length}/{missions.length} 達成):</span>
            <div className="flex items-center gap-1.5">
              {missions.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'w-6 bg-white' 
                      : m.completed 
                      ? 'bg-emerald-300' 
                      : 'bg-white/40'
                  }`}
                  title={m.title}
                />
              ))}
            </div>
          </div>

          <span className="text-[11px] text-amber-200">
            毎日更新されるので忘却曲線をリセットできます！✨
          </span>
        </div>
      </div>
    </div>
  );
};
