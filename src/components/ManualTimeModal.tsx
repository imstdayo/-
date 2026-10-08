import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Plus, 
  Calendar, 
  Check, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Home, 
  Library, 
  Sparkles,
  Trash2,
  History,
  AlertCircle
} from 'lucide-react';
import { SubjectScope, StudySessionLog } from '../types';

interface ManualTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectScope[];
  onAddStudyTime: (
    minutes: number, 
    subjectId?: string, 
    subjectName?: string, 
    category?: StudySessionLog['category'],
    categoryLabel?: string,
    notes?: string,
    date?: string
  ) => void;
  recentLogs?: StudySessionLog[];
  onDeleteLog?: (logId: string) => void;
}

const CATEGORIES: Array<{
  id: StudySessionLog['category'];
  label: string;
  icon: any;
  color: string;
}> = [
  { id: 'cram_school_class', label: '塾の授業', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'cram_school_self', label: '塾の自習室', icon: Building2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'library', label: '図書館・カフェ', icon: Library, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'school', label: '学校・放課後', icon: BookOpen, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'home_offline', label: '自宅 (タイマー未起動)', icon: Home, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

const PRESET_MINUTES = [
  { label: '30分', value: 30 },
  { label: '45分', value: 45 },
  { label: '60分 (1h)', value: 60 },
  { label: '90分 (1.5h)', value: 90 },
  { label: '120分 (2h)', value: 120 },
  { label: '180分 (3h)', value: 180 },
];

export const ManualTimeModal: React.FC<ManualTimeModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddStudyTime,
  recentLogs = [],
  onDeleteLog
}) => {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<StudySessionLog['category']>('cram_school_class');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  if (!isOpen) return null;

  const totalMinutes = hours * 60 + minutes;

  const handleApplyPreset = (mins: number) => {
    setHours(Math.floor(mins / 60));
    setMinutes(mins % 60);
  };

  const handleAdjustMinutes = (delta: number) => {
    const nextTotal = Math.max(5, Math.min(720, totalMinutes + delta));
    setHours(Math.floor(nextTotal / 60));
    setMinutes(nextTotal % 60);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const subjectName = selectedSubject ? selectedSubject.name : '全般・自習';
  const categoryMeta = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMinutes <= 0) return;

    onAddStudyTime(
      totalMinutes,
      selectedSubjectId || undefined,
      subjectName,
      selectedCategory,
      categoryMeta.label,
      notes.trim() || undefined,
      targetDate
    );

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-manual-time-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="modal-manual-time-title" className="text-lg font-bold">
                塾・オフライン学習の時間を追加
              </h2>
              <p className="text-xs text-blue-100">
                タイマーが使えなかった塾の授業や自習室での勉強を記録
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition"
            aria-label="閉じる"
            id="btn-close-manual-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (入力 / 履歴) */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'add'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            時間を追加
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            最近の追加履歴 ({recentLogs.length})
          </button>
        </div>

        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 1. 場所・学習カテゴリ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                学習場所・シチュエーション
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 学習時間（ワンクリックプリセット & 時分指定） */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  勉強時間
                </label>
                <span className="text-xs font-mono font-bold text-blue-600">
                  計 {totalMinutes} 分 ({hours > 0 ? `${hours}時間` : ''}{minutes > 0 ? `${minutes}分` : hours === 0 ? '0分' : ''})
                </span>
              </div>

              {/* プリセットボタン */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-3">
                {PRESET_MINUTES.map(preset => (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => handleApplyPreset(preset.value)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      totalMinutes === preset.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* 時間・分の手動調整 */}
              <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={hours}
                    onChange={e => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1.5 text-center text-lg font-black font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-600">時間</span>
                </div>

                <span className="text-slate-300 font-bold">:</span>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={minutes}
                    onChange={e => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1.5 text-center text-lg font-black font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-600">分</span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustMinutes(15)}
                    className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-md"
                  >
                    +15分
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustMinutes(30)}
                    className="px-2 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-md"
                  >
                    +30分
                  </button>
                </div>
              </div>
            </div>

            {/* 3. 教科選択 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                対象教科 (テスト範囲の進捗にも加算)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subjects.map(sub => {
                  const isSelected = selectedSubjectId === sub.id;
                  return (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: sub.color || '#3b82f6' }} 
                        />
                        <span className="truncate font-semibold">{sub.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                        現在 {sub.studiedMinutes || 0}分
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedSubjectId('')}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                    selectedSubjectId === ''
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                    <span className="truncate font-semibold">全般・その他自習 (特定教科なし)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. 学習日 & メモ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  学習した日
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setTargetDate(todayStr)}
                    className={`px-2.5 py-2 text-xs font-bold rounded-lg border shrink-0 ${
                      targetDate === todayStr 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    今日
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetDate(yesterdayStr)}
                    className={`px-2.5 py-2 text-xs font-bold rounded-lg border shrink-0 ${
                      targetDate === yesterdayStr 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    昨日
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  勉強内容・メモ (任意)
                </label>
                <input
                  type="text"
                  placeholder="例: 確認テスト演習、過去問演習2年分"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 反映内容のサマリー */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <div>
                  <span className="font-bold">反映内容: </span>
                  {categoryMeta.label} での「<span className="font-bold">{subjectName}</span>」の学習時間 
                  <span className="font-mono font-bold text-blue-700 ml-1">+{totalMinutes}分</span>
                </div>
                <div className="text-[11px] text-blue-700">
                  総合勉強時間、本日の学習時間、学習ストリーク（連続日数）、科目別進捗に反映されます。
                </div>
              </div>
            </div>

            {/* フッターアクション */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={totalMinutes <= 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                id="btn-submit-manual-time"
              >
                <Check className="w-4 h-4" />
                {totalMinutes}分の学習時間を記録する
              </button>
            </div>
          </form>
        ) : (
          /* 履歴タブ */
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700">
                最近手動追加された学習記録
              </h3>
              <span className="text-[11px] text-slate-500">
                最新 {recentLogs.length} 件
              </span>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">手動追加された学習記録はまだありません。</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  塾や自習室での勉強時間を「時間を追加」タブから登録できます。
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {recentLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.subjectName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium">
                          {log.categoryLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                      </div>
                      {log.notes && (
                        <p className="text-[11px] text-slate-600">{log.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-blue-600 text-sm">
                        +{log.minutes}分
                      </span>
                      {onDeleteLog && (
                        <button
                          onClick={() => {
                            if (window.confirm(`${log.subjectName}の+${log.minutes}分記録を取り消しますか？（勉強時間も減算されます）`)) {
                              onDeleteLog(log.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="記録を削除（時間を減算）"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> 新しい時間を追加
              </button>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="absolute inset-x-0 bottom-4 mx-auto w-fit bg-slate-900/95 text-white text-xs px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{subjectName}に {totalMinutes}分 の学習時間を追加しました！</span>
          </div>
        )}
      </div>
    </div>
  );
};
