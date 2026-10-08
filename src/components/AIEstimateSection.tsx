import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Loader2,
  HelpCircle,
  BarChart3,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { TestScope, SubjectScope } from '../types';

interface AIEstimateSectionProps {
  testScope: TestScope;
  onUpdateSubjectsWithEstimate: (updatedSubjects: SubjectScope[]) => void;
  onOpenAIAssistantWithPrompt: (prompt: string) => void;
}

export const AIEstimateSection: React.FC<AIEstimateSectionProps> = ({
  testScope,
  onUpdateSubjectsWithEstimate,
  onOpenAIAssistantWithPrompt
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Local editable state for current & target score
  const [subjectScores, setSubjectScores] = useState<Record<string, { current: number; target: number }>>(() => {
    const initial: Record<string, { current: number; target: number }> = {};
    testScope.subjects.forEach(s => {
      initial[s.id] = { current: s.currentScore, target: s.targetScore };
    });
    return initial;
  });

  const today = new Date();
  const testStart = new Date(testScope.startDate);
  const diffDays = Math.max(1, Math.ceil((testStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const [daysRemaining, setDaysRemaining] = useState(diffDays);

  const handleScoreChange = (id: string, field: 'current' | 'target', value: number) => {
    setSubjectScores(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleRunAIEstimate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payloadSubjects = testScope.subjects.map(s => ({
        id: s.id,
        name: s.name,
        currentScore: subjectScores[s.id]?.current ?? s.currentScore,
        targetScore: subjectScores[s.id]?.target ?? s.targetScore,
        textbookRange: s.textbookRange,
        workbookRange: s.workbookRange,
        keyTopics: s.keyTopics,
        itemsCount: s.items.length,
        uncompletedCount: s.items.filter(i => !i.completed).length
      }));

      const res = await fetch('/api/ai/estimate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: testScope.title,
          daysRemaining: daysRemaining,
          subjects: payloadSubjects
        })
      });

      if (!res.ok) {
        throw new Error('AI推定の取得に失敗しました');
      }

      const data = await res.json();
      const aiSubjects = data.subjects || [];

      // Merge results into testScope subjects
      const updated = testScope.subjects.map(sub => {
        const aiSub = aiSubjects.find((a: any) => a.subjectId === sub.id || a.subjectName === sub.name);
        const curScore = subjectScores[sub.id]?.current ?? sub.currentScore;
        const tarScore = subjectScores[sub.id]?.target ?? sub.targetScore;

        if (aiSub) {
          return {
            ...sub,
            currentScore: curScore,
            targetScore: tarScore,
            aiEstimatedHours: aiSub.estimatedHours,
            aiDailyHours: aiSub.dailyHours,
            aiPriorityLevel: aiSub.priorityLevel || '高',
            aiAdvice: aiSub.advice,
            aiMilestones: aiSub.keyMilestones
          };
        }
        return {
          ...sub,
          currentScore: curScore,
          targetScore: tarScore
        };
      });

      onUpdateSubjectsWithEstimate(updated);
      setSuccessMsg(`AI推定が完了しました！全教科合計で約 ${data.totalEstimatedHours || 35} 時間の学習が推奨されています。`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '推定処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const totalEstimatedHours = testScope.subjects.reduce((sum, s) => sum + (s.aiEstimatedHours || 8), 0);
  const dailyNeededHours = (totalEstimatedHours / Math.max(1, daysRemaining)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Gemini AI 学習プランナー
              </span>
              <span className="text-xs text-indigo-200">残り {daysRemaining} 日間</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              目標点数を取るための教科別AI推定必要時間
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100">
              「現在の自己評価・点数」と「目標点数」、そして試験範囲の分量からAIが教科ごとの推定必要時間と日割り学習計画を算出します。
            </p>
          </div>

          <button
            onClick={handleRunAIEstimate}
            disabled={isLoading}
            id="btn-run-ai-estimate"
            className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AIが最適時間を計算中…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                AIで推定必要時間を計算する
              </>
            )}
          </button>
        </div>

        {/* Aggregate AI Metric Badges */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <span className="text-[11px] text-indigo-200 block">試験まで全教科 推定必要時間</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {totalEstimatedHours.toFixed(1)}
              <span className="text-xs font-normal text-indigo-200 ml-1">時間</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <span className="text-[11px] text-indigo-200 block">1日あたりの推奨学習ノルマ</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">
              約 {dailyNeededHours}
              <span className="text-xs font-normal text-indigo-200 ml-1">時間 / 日</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/10 backdrop-blur border border-white/10">
            <span className="text-[11px] text-indigo-200 block">最重要フォーカス教科</span>
            <div className="text-base font-bold text-emerald-300 mt-1 truncate">
              {testScope.subjects.find(s => s.aiPriorityLevel === '最優先')?.name || testScope.subjects[0]?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Inputs & Tuning Parameters Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              各教科の現在の実力と目標点数の調整
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>残り日数:</span>
            <input
              type="number"
              min={1}
              max={60}
              value={daysRemaining}
              onChange={e => setDaysRemaining(Math.max(1, Number(e.target.value)))}
              className="w-14 px-2 py-1 rounded border border-slate-300 text-center font-bold"
            />
            <span>日</span>
          </div>
        </div>

        {/* Subject Score Sliders/Inputs */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testScope.subjects.map(subject => {
            const current = subjectScores[subject.id]?.current ?? subject.currentScore;
            const target = subjectScores[subject.id]?.target ?? subject.targetScore;
            const gap = target - current;

            return (
              <div key={subject.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                    {subject.name}
                  </span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                    gap > 20 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    差分: +{gap}点
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">前回/自己評価</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={current}
                      onChange={e => handleScoreChange(subject.id, 'current', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-300 font-semibold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">目標点数</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={target}
                      onChange={e => handleScoreChange(subject.id, 'target', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-white border border-slate-300 font-bold text-blue-600 text-center"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>AI推定必要時間:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {subject.aiEstimatedHours ? `${subject.aiEstimatedHours} 時間` : '未計算'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Breakdown Results: Per-Subject Strategy Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          AI教科別 推定時間＆学習戦略ロードマップ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testScope.subjects.map(subject => {
            const estHours = subject.aiEstimatedHours || 10;
            const dailyHours = subject.aiDailyHours || (estHours / daysRemaining).toFixed(1);
            const priority = subject.aiPriorityLevel || '高';

            return (
              <div key={subject.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                      <h3 className="font-bold text-slate-900 text-sm">{subject.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        priority === '最優先' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        priority === '高' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        優先度: {priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      範囲: {subject.workbookRange}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-500 block">推定必要時間</span>
                    <span className="text-xl font-bold font-mono text-blue-600">
                      {estHours}
                      <span className="text-xs font-normal text-slate-500 ml-0.5">時間</span>
                    </span>
                    <div className="text-[10px] text-slate-500">
                      (約 {dailyHours}時間 / 日)
                    </div>
                  </div>
                </div>

                {/* AI Advice */}
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-indigo-900 block mb-1">💡 得点アップの勘所:</span>
                  {subject.aiAdvice || `${subject.name}は基礎計算の失点を防ぎ、提出ワークの重要問題を2回反復することで目標点到達が見込めます。`}
                </div>

                {/* Milestones */}
                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">
                    推奨学習マイルストーン (いつまでに何を):
                  </span>
                  <div className="space-y-1.5">
                    {(subject.aiMilestones || [
                      '提出ワーク1周目を試験5日前までに完了',
                      '間違えた問題の解き直しと公式・単語の総整理',
                      '予想問題・過去問演習で制限時間内の解法確認'
                    ]).map((m, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onOpenAIAssistantWithPrompt(`${subject.name}の目標点${subject.targetScore}点に向けて、あと${daysRemaining}日で${estHours}時間勉強するための1日ごとのタイムスケジュール案を作成してください。`)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  この教科の詳細日割りスケジュールをAIに相談
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
