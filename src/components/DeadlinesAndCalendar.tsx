import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  CalendarDays,
  Sparkles,
  Check,
  Target,
  ArrowRight,
  TrendingUp,
  X,
  GraduationCap
} from 'lucide-react';
import { SubmissionDeadline, SubjectScope, TestScope, DailyStudyTask } from '../types';

interface DeadlinesAndCalendarProps {
  deadlines: SubmissionDeadline[];
  testScope: TestScope;
  dailyTasks: DailyStudyTask[];
  onToggleDailyTask: (taskId: string) => void;
  onAddDailyTask: (task: Omit<DailyStudyTask, 'id' | 'completed'>) => void;
  onToggleDeadline: (id: string) => void;
  onAddDeadline: (newDeadline: SubmissionDeadline) => void;
  onDeleteDeadline: (id: string) => void;
  onUpdateSubject?: (subjectId: string, updated: SubjectScope) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenManualTimeModal?: () => void;
}

export const DeadlinesAndCalendar: React.FC<DeadlinesAndCalendarProps> = ({
  deadlines,
  testScope,
  dailyTasks,
  onToggleDailyTask,
  onAddDailyTask,
  onToggleDeadline,
  onAddDeadline,
  onDeleteDeadline,
  onUpdateSubject,
  onNavigateTab,
  onOpenManualTimeModal
}) => {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // New deadline modal
  const [isAddDeadlineModalOpen, setIsAddDeadlineModalOpen] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineSubjectId, setNewDeadlineSubjectId] = useState(testScope.subjects[0]?.id || '');
  const [newDeadlineDueDate, setNewDeadlineDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDeadlineNotes, setNewDeadlineNotes] = useState('');

  // Quick add task for selected date
  const [newTaskTopic, setNewTaskTopic] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(testScope.subjects[0]?.name || '数学');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);

  // AI Estimate interactive state
  const [isRecalculatingAI, setIsRecalculatingAI] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push(dateStr);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Days remaining until test start
  const testStartDate = new Date(testScope.startDate);
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((testStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Total estimated hours across all subjects
  const totalAIHours = testScope.subjects.reduce((sum, s) => sum + (s.aiEstimatedHours || 8.0), 0);
  const dailyHoursAvg = daysRemaining > 0 ? (totalAIHours / daysRemaining).toFixed(1) : totalAIHours.toFixed(1);

  const dailyHoursNumber = parseFloat(dailyHoursAvg);
  const dailyHoursWhole = Math.floor(dailyHoursNumber);
  const dailyHoursMins = Math.round((dailyHoursNumber - dailyHoursWhole) * 60);

  // Selected date formatted: 例: 9月10日 木曜日
  const getFormattedSelectedDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      return `${m}月${d}日 ${weekdays[dateObj.getDay()]}曜日`;
    } catch {
      return dateStr;
    }
  };

  // Filter deadlines for selected date
  const selectedDateDeadlines = deadlines.filter(d => d.dueDate === selectedDateStr);

  // Filter or show study tasks
  const isSelectedDateToday = selectedDateStr === todayStr;

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadlineTitle.trim()) return;

    const sub = testScope.subjects.find(s => s.id === newDeadlineSubjectId) || testScope.subjects[0];
    const newDeadline: SubmissionDeadline = {
      id: 'd_' + Date.now(),
      title: newDeadlineTitle.trim(),
      subjectId: sub?.id || 'other',
      subjectName: sub?.name || '全教科',
      dueDate: newDeadlineDueDate,
      completed: false,
      notes: newDeadlineNotes.trim() || undefined
    };

    onAddDeadline(newDeadline);
    setIsAddDeadlineModalOpen(false);
    setNewDeadlineTitle('');
    setNewDeadlineNotes('');
  };

  const handleCreateDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTopic.trim()) return;
    onAddDailyTask({
      subjectName: newTaskSubject,
      topic: newTaskTopic.trim(),
      estimatedMinutes: Number(newTaskMinutes) || 30,
      category: 'important',
      dueDate: selectedDateStr
    });
    setNewTaskTopic('');
  };

  const handleRecalculateAI = async () => {
    setIsRecalculatingAI(true);
    try {
      const res = await fetch('/api/ai/estimate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: testScope.title,
          daysRemaining,
          subjects: testScope.subjects
        })
      });
      const data = await res.json();
      if (data.subjects && onUpdateSubject) {
        data.subjects.forEach((aiSub: any) => {
          const existing = testScope.subjects.find(s => s.id === aiSub.subjectId);
          if (existing) {
            onUpdateSubject(existing.id, {
              ...existing,
              aiEstimatedHours: aiSub.estimatedHours,
              aiDailyHours: aiSub.dailyHours,
              aiPriorityLevel: aiSub.priorityLevel,
              aiAdvice: aiSub.advice,
              aiMilestones: aiSub.keyMilestones
            });
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecalculatingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              学習計画・カレンダー
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
              日別タスク＆必要時間ナビ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            カレンダーで提出期限と学習予定を把握し、目標点数に必要な学習時間を逆算管理
          </p>
        </div>
        {onOpenManualTimeModal && (
          <button
            onClick={onOpenManualTimeModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 whitespace-nowrap self-start sm:self-auto"
            id="btn-calendar-add-manual-time"
            title="塾などタイマーを使わなかった勉強時間を追加"
          >
            <Clock className="w-4 h-4 text-blue-200 shrink-0" />
            <span className="whitespace-nowrap">塾・学習時間を手動追加</span>
          </button>
        )}
      </div>

      {/* 2. AIによる必要時間の表示 (大きな数字で見せる) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
                AI推定学習時間
              </span>
              <span className="text-xs text-blue-100">目標点数から逆算</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              目標点数までに必要な学習時間
            </h2>
            <p className="text-xs text-blue-100">
              各教科の現在の理解度と目標スコアのギャップからAIが最適配分を算出
            </p>
          </div>

          {/* 1日あたりの目安を大きな数字で表示 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15 flex items-center gap-6 shrink-0">
            <div>
              <span className="text-xs text-blue-100 block">テストまであと</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {daysRemaining}
                <span className="text-sm font-normal text-white ml-0.5">日</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <span className="text-xs text-blue-100 block">1日あたりの学習目安</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                約{dailyHoursWhole > 0 ? `${dailyHoursWhole}時間` : ''}{dailyHoursMins}分
              </div>
            </div>
          </div>
        </div>

        {/* 各教科の推定必要時間 */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {testScope.subjects.map(sub => {
            const hours = sub.aiEstimatedHours || 8.0;
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return (
              <div key={sub.id} className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 text-center">
                <span className="text-xs font-bold text-white block truncate">
                  {sub.name}
                </span>
                <div className="text-lg font-black text-amber-300 font-mono mt-1">
                  あと{h}時間{m > 0 ? `${m}分` : ''}
                </div>
                <span className="text-[10px] text-blue-100 mt-0.5 block">
                  目標 {sub.targetScore}点
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRecalculateAI}
            disabled={isRecalculatingAI}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isRecalculatingAI ? 'AI再計算中...' : '目標点数と推定時間を再計算'}
          </button>
        </div>
      </div>

      {/* 3. 上部にカレンダー ＆ 下部にその日のタスク */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Column - 7 Cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Calendar Header with Legend */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                  {year}年 {month + 1}月
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  今日
                </button>
                <button
                  onClick={() => setIsAddDeadlineModalOpen(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> 提出物を登録
                </button>
              </div>
            </div>

            {/* Dot Legend (青：学習予定, オレンジ：提出期限, 赤：期限直前, 緑：完了済み) */}
            <div className="py-2.5 px-3 bg-slate-50 rounded-xl my-3 flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
              <span className="font-semibold text-slate-500">ドット凡例:</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                青: 学習予定
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                オレンジ: 提出期限
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                赤: 期限直前
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                緑: 完了済み
              </span>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-1">
              <span className="text-rose-500">日</span>
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span className="text-blue-500">土</span>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((dateStr, index) => {
                if (!dateStr) {
                  return <div key={`empty-${index}`} className="h-16 rounded-xl bg-slate-50/50" />;
                }

                const dayNum = parseInt(dateStr.split('-')[2], 10);
                const isSelected = dateStr === selectedDateStr;
                const isToday = dateStr === todayStr;

                // Deadlines for this day
                const dayDeadlines = deadlines.filter(d => d.dueDate === dateStr);
                const hasPendingDeadline = dayDeadlines.some(d => !d.completed);
                const hasCompletedDeadline = dayDeadlines.some(d => d.completed);

                // Urgent check: if due date is within 2 days of today
                const dDate = new Date(dateStr);
                const diffDays = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgentPending = hasPendingDeadline && diffDays >= 0 && diffDays <= 2;

                // Study tasks scheduled for this day
                const dayTasks = dailyTasks.filter(t => (t.dueDate || todayStr) === dateStr);
                const hasStudyTask = dayTasks.length > 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-16 p-1.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/30 font-bold'
                        : isToday
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono ${
                        isToday ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold' : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>
                    </div>

                    {/* Color Dots */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* 青: 学習予定 */}
                      {hasStudyTask && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" title="学習予定あり" />
                      )}
                      {/* 赤: 期限直前 or オレンジ: 提出期限 */}
                      {isUrgentPending ? (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="期限直前の提出物" />
                      ) : hasPendingDeadline ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="提出期限" />
                      ) : null}
                      {/* 緑: 完了済み */}
                      {hasCompletedDeadline && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="完了済み課題あり" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Tasks & Submissions Column - 5 Cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Selected Date Header */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 block">選択中の日付</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {getFormattedSelectedDate(selectedDateStr)}
                </h3>
              </div>
              {isSelectedDateToday && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  本日
                </span>
              )}
            </div>

            {/* 1. 今日の学習 (タスク＋所要時間) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  今日の学習予定 (タスク)
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} 完了
                </span>
              </div>

              {/* Task list for selected date */}
              <div className="space-y-2">
                {dailyTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    学習タスクはありません
                  </div>
                ) : (
                  dailyTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onToggleDailyTask(task.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        task.completed
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                          {task.completed && <Check className="w-3 h-3" />}
                        </div>
                        <span className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.subjectName}：{task.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-amber-100 text-amber-800">
                          +40pt
                        </span>
                        <span className="text-[11px] font-mono font-medium text-slate-500">
                          {task.estimatedMinutes}分
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick task adder */}
              <form onSubmit={handleCreateDailyTask} className="mt-3 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="追加する学習内容"
                  value={newTaskTopic}
                  onChange={e => setNewTaskTopic(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                />
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={newTaskMinutes}
                  onChange={e => setNewTaskMinutes(Number(e.target.value))}
                  className="w-12 text-xs px-1.5 py-1.5 rounded-lg border border-slate-300 font-mono text-center"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  追加
                </button>
              </form>
            </div>

            {/* 2. 提出物 (提出期限がある課題) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  提出物 (締切)
                </h4>
                <div className="flex items-center gap-1.5">
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('classroom')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 transition"
                      title="Google Classroomから課題を取り込む"
                      id="btn-calendar-goto-classroom"
                    >
                      <GraduationCap className="w-3 h-3" />
                      Classroom連携
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedDateDeadlines.length} 件
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedDateDeadlines.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    この日の提出物はありません。
                  </div>
                ) : (
                  selectedDateDeadlines.map(deadline => (
                    <div
                      key={deadline.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={deadline.completed}
                          onChange={() => onToggleDeadline(deadline.id)}
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className={`text-xs font-bold flex items-center gap-1.5 ${deadline.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            <span>{deadline.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-amber-100 text-amber-800">
                              +50pt
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{deadline.subjectName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteDeadline(deadline.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. New Deadline Registration Modal */}
      {isAddDeadlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                提出物の締切を登録
              </h3>
              <button
                onClick={() => setIsAddDeadlineModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeadline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  提出物名（ワーク・ノート・レポート等）
                </label>
                <input
                  type="text"
                  placeholder="例: 英語ワーク p.20〜p.45"
                  value={newDeadlineTitle}
                  onChange={e => setNewDeadlineTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    教科
                  </label>
                  <select
                    value={newDeadlineSubjectId}
                    onChange={e => setNewDeadlineSubjectId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {testScope.subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    提出期限日
                  </label>
                  <input
                    type="date"
                    value={newDeadlineDueDate}
                    onChange={e => setNewDeadlineDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  備考・提出場所など（任意）
                </label>
                <input
                  type="text"
                  placeholder="例: 朝のSHRで教卓に提出。丸つけ必須"
                  value={newDeadlineNotes}
                  onChange={e => setNewDeadlineNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeadlineModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  カレンダーに登録
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
