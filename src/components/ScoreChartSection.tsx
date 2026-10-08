import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Clock, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { TestScope, CameraAnalysisResult, UserProfile } from '../types';

interface ScoreChartSectionProps {
  testScope: TestScope;
  currentUser: UserProfile;
  analysisHistory: CameraAnalysisResult[];
  onOpenCameraModal: () => void;
}

export const ScoreChartSection: React.FC<ScoreChartSectionProps> = ({
  testScope,
  currentUser,
  analysisHistory,
  onOpenCameraModal
}) => {
  // Score diff and mock trend (↑8, ↓3, ↑5 etc.)
  const scoreTrends = [
    { subjectName: '数学', prevScore: 70, currentScore: 78, diff: 8, isUp: true },
    { subjectName: '英語', prevScore: 67, currentScore: 64, diff: -3, isUp: false },
    { subjectName: '理科', prevScore: 77, currentScore: 82, diff: 5, isUp: true },
    { subjectName: '国語', prevScore: 68, currentScore: 74, diff: 6, isUp: true },
    { subjectName: '社会', prevScore: 72, currentScore: 70, diff: -2, isUp: false }
  ];

  // Radar Chart calculation (SVG 5-axis or N-axis polygon)
  const subjects = testScope.subjects.slice(0, 6);
  const numAxes = Math.max(3, subjects.length);
  const radarRadius = 80;
  const centerX = 120;
  const centerY = 120;

  // Generate radar polygon points
  const points = subjects.map((sub, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    // Score ratio (0 to 1)
    const ratio = Math.min(1, Math.max(0.2, sub.currentScore / 100));
    const r = radarRadius * ratio;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y, angle, sub };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Web guide circles
  const levels = [0.33, 0.66, 1.0];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              成績・苦手分析
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              得手不得手グラフ＆カメラ診断
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            点数の推移、得意・不得意のバランス、カメラで答案を分析した安心のアクションプラン
          </p>
        </div>

        <button
          onClick={onOpenCameraModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs self-start transition"
        >
          <Camera className="w-4 h-4" />
          カメラで答案・ノートを分析
        </button>
      </div>

      {/* 2. 点数の推移（↑8, ↓3, ↑5 など矢印と数値） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              直近テストの点数推移
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">前々回比の変動スコア</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {scoreTrends.map(item => (
            <div
              key={item.subjectName}
              className={`p-3 rounded-xl border text-center transition ${
                item.isUp
                  ? 'bg-emerald-50/50 border-emerald-200/80'
                  : 'bg-rose-50/40 border-rose-200/80'
              }`}
            >
              <span className="text-xs font-bold text-slate-700 block mb-0.5">
                {item.subjectName}
              </span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {item.currentScore}
                <span className="text-xs font-normal text-slate-500 ml-0.5">点</span>
              </div>
              <div className={`mt-1 text-xs font-bold flex items-center justify-center gap-0.5 ${
                item.isUp ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {item.isUp ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{item.diff}点 UP
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {item.diff}点
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 得意・苦手を表すレーダーチャート ＆ 教科別目標ギャップ棒グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 得意・苦手を表すレーダーチャート (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  🕸️
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    得意・不得意レーダーチャート
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    現在の教科別バランスと苦手分野をひと目で把握
                  </p>
                </div>
              </div>
            </div>

            {/* SVG Radar Chart */}
            <div className="flex items-center justify-center py-4">
              <svg width="240" height="240" className="overflow-visible">
                {/* Background web polygon grids */}
                {levels.map((lvl, lidx) => {
                  const gridPoints = subjects.map((_, i) => {
                    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                    const r = radarRadius * lvl;
                    return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                  }).join(' ');

                  return (
                    <polygon
                      key={lidx}
                      points={gridPoints}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Axis lines */}
                {subjects.map((_, i) => {
                  const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                  const x = centerX + radarRadius * Math.cos(angle);
                  const y = centerY + radarRadius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Filled Radar Area */}
                <polygon
                  points={polygonPath}
                  fill="rgba(59, 130, 246, 0.25)"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />

                {/* Radar Vertex Points and Labels */}
                {points.map((p, i) => {
                  const labelRadius = radarRadius + 22;
                  const labelX = centerX + labelRadius * Math.cos(p.angle);
                  const labelY = centerY + labelRadius * Math.sin(p.angle);

                  return (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[11px] font-bold fill-slate-700"
                      >
                        {p.sub.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            外側に広がるほど「得意」、内側ほど「重点復習」が必要です
          </div>
        </div>

        {/* Right: 教科別棒グラフ ＆ 目標点との差ゲージ (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    教科別：目標点数 vs 現在の自己評価
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    目標点とのギャップを埋めるための達成ゲージ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> 現在
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" /> 目標
                </span>
              </div>
            </div>

            {/* Subject bars with Goal Difference Gauges */}
            <div className="mt-4 space-y-4">
              {testScope.subjects.map(sub => {
                const gap = sub.targetScore - sub.currentScore;
                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span>{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500">{sub.currentScore}点</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-blue-600">目標 {sub.targetScore}点</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          あと+{gap}点
                        </span>
                      </div>
                    </div>

                    {/* Dual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden">
                      {/* Target point indicator line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-blue-600 z-10"
                        style={{ left: `${sub.targetScore}%` }}
                        title={`目標: ${sub.targetScore}点`}
                      />
                      {/* Current Score Fill */}
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${sub.currentScore}%`,
                          backgroundColor: sub.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>全教科平均目標: {Math.round(testScope.subjects.reduce((s, sub) => s + sub.targetScore, 0) / testScope.subjects.length)}点</span>
            <span className="text-blue-600 font-semibold">青い縦線が目標点ライン</span>
          </div>
        </div>
      </div>

      {/* 4. カメラを使った得意・不得意分析（答案やノートを撮影するとAIが分析） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                カメラ診断：AI答案・ノート得手不得手分析
              </h3>
              <p className="text-xs text-slate-500">
                テスト答案や間違えたノートを写すと、AIが復習ポイントを柔らかい表現でアドバイス
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCameraModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Camera className="w-4 h-4" />
            新しく答案を撮影して分析
          </button>
        </div>

        {/* Diagnosis Results with Warm / Encouraging tone */}
        {analysisHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            まだ答案の分析履歴がありません。定期テストの答案やワークのノートを撮影してみましょう！
          </div>
        ) : (
          <div className="space-y-4">
            {analysisHistory.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {item.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {item.date} 診断
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {item.overallScoreAssessment}
                  </span>
                </div>

                {/* Soft & Constructive Advice (「今回の答案から見ると、復習すると効果が高そうな分野」) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1.5">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      復習すると効果が高そうな分野（伸び代）:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc">
                      {item.identifiedWeaknesses.map((w, widx) => (
                        <li key={widx}>
                          <span className="font-semibold">{w.topic}</span>: {w.explanation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      しっかり定着している強み:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc">
                      {item.identifiedStrengths.map((s, sidx) => (
                        <li key={sidx}>
                          <span className="font-semibold">{s.topic}</span>: {s.explanation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan */}
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-blue-900 block mb-1">
                    🎯 次のテストに向けた3ステップアクション:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                    {item.actionPlan.map((act, aidx) => (
                      <div key={aidx} className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {aidx + 1}
                        </span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
