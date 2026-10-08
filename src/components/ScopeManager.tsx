import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Camera, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle,
  ChevronRight,
  Target,
  FileCheck,
  X,
  FileText,
  HelpCircle,
  Clock,
  ArrowRight,
  CameraOff,
  Loader2
} from 'lucide-react';
import { TestScope, SubjectScope, ScopeCheckItem, MasteryLevel } from '../types';
import { acquireCameraStream, readAndCompressImageFile } from '../lib/cameraUtils';
import { HIGH_SCHOOL_SUBJECTS, HighSchoolSubjectDefinition } from '../constants/subjects';

interface ScopeManagerProps {
  testScope: TestScope;
  onUpdateSubject: (subjectId: string, updatedSubject: SubjectScope) => void;
  onAddSubject: (newSubject: SubjectScope) => void;
  onOpenAIAssistantWithPrompt: (prompt: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const ScopeManager: React.FC<ScopeManagerProps> = ({
  testScope,
  onUpdateSubject,
  onAddSubject,
  onOpenAIAssistantWithPrompt,
  onNavigateTab
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(
    testScope.subjects[0]?.id || ''
  );
  const [filterMastery, setFilterMastery] = useState<string>('all');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPages, setNewItemPages] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Floating "Add Scope" Multi-mode Modal
  const [isAddScopeModalOpen, setIsAddScopeModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'camera_upload' | 'ai_text'>('camera_upload');

  // Manual Mode Form
  const [manualName, setManualName] = useState('');
  const [manualTargetScore, setManualTargetScore] = useState(80);
  const [manualTextbook, setManualTextbook] = useState('');
  const [manualWorkbook, setManualWorkbook] = useState('');
  const [manualTopics, setManualTopics] = useState('');
  const [manualColor, setManualColor] = useState<string>('');

  const handleSelectPresetSubject = (sub: HighSchoolSubjectDefinition) => {
    setManualName(sub.name);
    setManualTargetScore(sub.defaultTargetScore);
    setManualTextbook(sub.defaultTextbook);
    setManualWorkbook(sub.defaultWorkbook);
    setManualTopics(sub.sampleTopics.slice(0, 3).join(', '));
    setManualColor(sub.color);
  };

  // Camera / Image Upload Mode
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement | null>(null);

  // AI Text input
  const [aiTextPrompt, setAiTextPrompt] = useState('');

  // Scanned / Preview Confirmation state
  const [scannedResult, setScannedResult] = useState<{
    recognizedTitle: string;
    subjects: {
      name: string;
      textbookRange: string;
      workbookRange: string;
      keyTopics: string[];
    }[];
  } | null>(null);

  const activeSubject = testScope.subjects.find(s => s.id === activeSubjectId) || testScope.subjects[0];

  // Helper for Mastery colors
  // 緑：理解済み, 青：学習中, グレー：未着手, 赤・オレンジ：苦手・要注意
  const getMasteryBadge = (level: MasteryLevel) => {
    switch (level) {
      case 'perfect':
        return {
          label: '理解済み',
          colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dotColor: 'bg-emerald-500'
        };
      case 'good':
        return {
          label: '学習中',
          colorClass: 'bg-blue-50 text-blue-700 border-blue-300',
          dotColor: 'bg-blue-500'
        };
      case 'shaky':
        return {
          label: '苦手・要注意',
          colorClass: 'bg-rose-50 text-rose-700 border-rose-300',
          dotColor: 'bg-rose-500'
        };
      case 'not_started':
      default:
        return {
          label: '未着手',
          colorClass: 'bg-slate-50 text-slate-600 border-slate-200',
          dotColor: 'bg-slate-400'
        };
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (!activeSubject) return;
    const updatedItems = activeSubject.items.map(item => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          masteryLevel: nextCompleted && item.masteryLevel === 'not_started' ? ('good' as MasteryLevel) : item.masteryLevel
        };
      }
      return item;
    });

    onUpdateSubject(activeSubject.id, {
      ...activeSubject,
      items: updatedItems
    });
  };

  const handleChangeMastery = (itemId: string, mastery: MasteryLevel) => {
    if (!activeSubject) return;
    const updatedItems = activeSubject.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          masteryLevel: mastery,
          completed: mastery === 'perfect' || mastery === 'good'
        };
      }
      return item;
    });

    onUpdateSubject(activeSubject.id, {
      ...activeSubject,
      items: updatedItems
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeSubject) return;
    const updatedItems = activeSubject.items.filter(i => i.id !== itemId);
    onUpdateSubject(activeSubject.id, {
      ...activeSubject,
      items: updatedItems
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !activeSubject) return;

    const newItem: ScopeCheckItem = {
      id: 'item_' + Date.now(),
      title: newItemTitle.trim(),
      category: 'workbook',
      pageRange: newItemPages.trim() || undefined,
      completed: false,
      masteryLevel: 'not_started'
    };

    onUpdateSubject(activeSubject.id, {
      ...activeSubject,
      items: [...activeSubject.items, newItem]
    });

    setNewItemTitle('');
    setNewItemPages('');
    setIsAddingItem(false);
  };

  // Camera start/stop
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      const result = await acquireCameraStream();
      if (result.stream) {
        setCameraActive(true);
        streamRef.current = result.stream;
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraActive(false);
        setCameraError(result.errorMessage || 'カメラが検出されませんでした。画像アップロードをご利用ください。');
      }
    } catch {
      setCameraActive(false);
      setCameraError('カメラの起動に失敗しました。画像アップロードをご利用ください。');
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await readAndCompressImageFile(file, 1600, 0.85);
      setSelectedImage(compressedDataUrl);
      stopCamera();
    } catch (err) {
      console.error('Scope image compression error:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    } finally {
      e.target.value = '';
    }
  };

  // Run AI Scan for scope
  const handleScanScope = async () => {
    if (!selectedImage && !aiTextPrompt.trim()) return;
    setIsScanning(true);
    try {
      const res = await fetch('/api/ai/scan-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          textNotes: aiTextPrompt
        })
      });
      const data = await res.json();
      setScannedResult(data);
    } catch (err) {
      console.error(err);
      alert('テスト範囲の読み取りに失敗しました。');
    } finally {
      setIsScanning(false);
    }
  };

  // Confirm registration from Scanned Result
  const handleConfirmAddScannedSubjects = () => {
    if (!scannedResult) return;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    scannedResult.subjects.forEach((sub, idx) => {
      const newSub: SubjectScope = {
        id: 'sub_' + Date.now() + '_' + idx,
        name: sub.name || '新規教科',
        color: colors[(testScope.subjects.length + idx) % colors.length],
        targetScore: 80,
        currentScore: 60,
        textbookRange: sub.textbookRange || '教科書指定範囲',
        workbookRange: sub.workbookRange || 'ワーク指定範囲',
        handoutRange: '授業プリント・配布物',
        keyTopics: sub.keyTopics || ['重要単元'],
        studiedMinutes: 0,
        items: (sub.keyTopics || ['基本単元の演習', '提出ワークの解き直し']).map((t, tidx) => ({
          id: `item_${Date.now()}_${idx}_${tidx}`,
          title: t,
          category: 'workbook',
          completed: false,
          masteryLevel: 'not_started'
        }))
      };
      onAddSubject(newSub);
    });

    setIsAddScopeModalOpen(false);
    setScannedResult(null);
    setSelectedImage(null);
    setAiTextPrompt('');
  };

  // Handle manual subject add
  const handleCreateManualSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const newSub: SubjectScope = {
      id: 'sub_' + Date.now(),
      name: manualName.trim(),
      color: manualColor || colors[testScope.subjects.length % colors.length],
      targetScore: Number(manualTargetScore) || 80,
      currentScore: 60,
      textbookRange: manualTextbook.trim() || '教科書指定範囲',
      workbookRange: manualWorkbook.trim() || '問題集指定範囲',
      handoutRange: '授業プリント',
      keyTopics: manualTopics ? manualTopics.split(/[,、]/).map(t => t.trim()).filter(Boolean) : ['基本単元'],
      studiedMinutes: 0,
      items: [
        { id: 'i1_' + Date.now(), title: '教科書の範囲通読・基本公式確認', category: 'textbook', completed: false, masteryLevel: 'not_started' },
        { id: 'i2_' + Date.now(), title: 'ワーク提出範囲の1周目完了', category: 'workbook', completed: false, masteryLevel: 'not_started' }
      ]
    };

    onAddSubject(newSub);
    setActiveSubjectId(newSub.id);
    setIsAddScopeModalOpen(false);
    setManualName('');
    setManualColor('');
    setManualTextbook('');
    setManualWorkbook('');
    setManualTopics('');
  };

  const hasSubjects = testScope.subjects.length > 0 && !!activeSubject;

  // Filtered items
  const filteredItems = activeSubject?.items.filter(item => {
    if (filterMastery === 'all') return true;
    return item.masteryLevel === filterMastery;
  }) || [];

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Title & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              テスト範囲整理
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              誤認防止ナビ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            「範囲の誤解」「勉強内容の把握不足」を完全解消。教科ごとに進捗と習得度を整理できます
          </p>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('classroom')}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Classroomから自動同期
          </button>
        )}
      </div>

      {!hasSubjects ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            テスト範囲データは現在ゼロ（初期状態）です
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Google Classroomに投稿された授業課題や連絡事項から、AIが教科・教科書ページ・指定ワーク・チェックリストを自動抽出して適用できます。
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('classroom')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                Google ClassroomでAI解析する →
              </button>
            )}
            <button
              onClick={() => setIsAddScopeModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              手動または写真で追加する
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. 教科カード一覧（数学 進捗70%、英語 進捗40% 等） */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {testScope.subjects.map(subject => {
          const isSelected = subject.id === activeSubject.id;
          const total = subject.items.length;
          const completed = subject.items.filter(i => i.completed).length;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <button
              key={subject.id}
              onClick={() => setActiveSubjectId(subject.id)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {subject.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {completed}/{total}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="text-slate-500 text-[11px]">進捗</span>
                  <span className="font-black font-mono text-slate-900 text-sm">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Active Subject Detail Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Subject Header & Defined Ranges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: activeSubject.color }}
              />
              <h2 className="text-xl font-bold text-slate-900">
                {activeSubject.name} のテスト範囲詳細
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              目標点数: <span className="font-bold text-blue-600">{activeSubject.targetScore}点</span>
            </p>
          </div>

          {/* Color Legend (緑: 理解済み, 青: 学習中, グレー: 未着手, 赤: 苦手・要注意) */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 font-semibold mr-1">状態凡例:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 理解済み
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> 学習中
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> 苦手・要注意
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> 未着手
            </span>
          </div>
        </div>

        {/* Specified Scope Badges (誤認防止の具体情報) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/60">
            <span className="text-[11px] font-bold text-blue-700 block mb-1">
              📖 教科書・授業範囲
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {activeSubject.textbookRange}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <span className="text-[11px] font-bold text-emerald-700 block mb-1">
              📝 ワーク・問題集範囲 (提出物)
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {activeSubject.workbookRange}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200/60">
            <span className="text-[11px] font-bold text-purple-700 block mb-1">
              📑 配布プリント・頻出単元
            </span>
            <p className="text-xs font-semibold text-slate-800">
              {activeSubject.handoutRange}
            </p>
          </div>
        </div>

        {/* Check items Filter & Add */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterMastery('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMastery === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              すべて ({activeSubject.items.length})
            </button>
            <button
              onClick={() => setFilterMastery('shaky')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterMastery === 'shaky'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              苦手・要注意 ({activeSubject.items.filter(i => i.masteryLevel === 'shaky').length})
            </button>
            <button
              onClick={() => setFilterMastery('good')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterMastery === 'good'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              学習中 ({activeSubject.items.filter(i => i.masteryLevel === 'good').length})
            </button>
            <button
              onClick={() => setFilterMastery('perfect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterMastery === 'perfect'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              理解済み ({activeSubject.items.filter(i => i.masteryLevel === 'perfect').length})
            </button>
            <button
              onClick={() => setFilterMastery('not_started')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterMastery === 'not_started'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              未着手 ({activeSubject.items.filter(i => i.masteryLevel === 'not_started').length})
            </button>
          </div>

          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 self-start sm:self-auto transition"
          >
            <Plus className="w-3.5 h-3.5" />
            単元・課題を追加
          </button>
        </div>

        {/* Quick inline item adder */}
        {isAddingItem && (
          <form onSubmit={handleAddItem} className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="単元・課題名（例: 二次関数の最大最小）"
                value={newItemTitle}
                onChange={e => setNewItemTitle(e.target.value)}
                className="sm:col-span-2 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="ページ範囲（例: p.40〜48）"
                value={newItemPages}
                onChange={e => setNewItemPages(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                追加する
              </button>
            </div>
          </form>
        )}

        {/* Check items list */}
        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              該当する単元・課題はありません。
            </div>
          ) : (
            filteredItems.map(item => {
              const badge = getMasteryBadge(item.masteryLevel);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.completed
                      ? 'bg-slate-50/60 border-slate-200'
                      : item.masteryLevel === 'shaky'
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                        {item.pageRange && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {item.pageRange}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Mastery Level Selector Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => handleChangeMastery(item.id, 'shaky')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          item.masteryLevel === 'shaky'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-rose-700 hover:bg-white'
                        }`}
                        title="苦手・要注意"
                      >
                        苦手△
                      </button>
                      <button
                        onClick={() => handleChangeMastery(item.id, 'good')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          item.masteryLevel === 'good'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-blue-700 hover:bg-white'
                        }`}
                        title="学習中"
                      >
                        学習中○
                      </button>
                      <button
                        onClick={() => handleChangeMastery(item.id, 'perfect')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          item.masteryLevel === 'perfect'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-emerald-700 hover:bg-white'
                        }`}
                        title="理解済み"
                      >
                        理解済✓
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded transition"
                      title="削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. 目立つフローティング追加ボタン「＋ 範囲を追加」 (右下に固定配置) */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-30">
        <button
          onClick={() => {
            setIsAddScopeModalOpen(true);
            setScannedResult(null);
            setSelectedImage(null);
          }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 border-2 border-white focus:outline-none focus:ring-4 focus:ring-blue-300"
          id="btn-floating-add-scope"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>範囲を追加</span>
        </button>
      </div>
      </>
      )}

      {/* 5. 範囲追加モーダル (手入力、写真撮影、画像アップロード、AIで整理) */}
      {isAddScopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    テスト範囲の追加・登録
                  </h3>
                  <p className="text-xs text-slate-500">
                    プリントや黒板の写真、または手入力で簡単に整理
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setIsAddScopeModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setAddMode('camera_upload');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  addMode === 'camera_upload'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                写真・画像から
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setAddMode('ai_text');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  addMode === 'ai_text'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AIに整理してもらう
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setAddMode('manual');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  addMode === 'manual'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                手入力
              </button>
            </div>

            {/* 1. Camera / Upload Mode */}
            {addMode === 'camera_upload' && !scannedResult && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  配られたテスト範囲表プリントや黒板のメモを撮影すると、AIが教科・単元を自動抽出します。
                </div>

                {isCameraLoading ? (
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center text-white gap-2 p-6">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="text-xs font-semibold">カメラデバイスを検出・起動中…</span>
                  </div>
                ) : cameraActive ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={capturePhoto}
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
                      >
                        写真を撮影して決定
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        停止
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 flex items-center justify-center bg-slate-50">
                      <img src={selectedImage} alt="Preview" className="max-h-56 object-contain" />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleScanScope}
                      disabled={isScanning}
                      className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          AIがテスト範囲を読み取り中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          この画像からテスト範囲を整理する
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cameraError && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                        <CameraOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold">{cameraError}</p>
                          <p className="text-slate-600 mt-0.5">
                            下の「画像アップロード」から画像ファイルを選択してテスト範囲を読み取れます。
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Hidden inputs for 100% mobile support */}
                    <input
                      id="scope-mobile-camera-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                    <input
                      id="scope-mobile-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        htmlFor="scope-mobile-camera-input"
                        className="p-5 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">スマホのカメラで撮影</span>
                        <span className="text-[11px] text-slate-500">プリントや黒板を直接撮影</span>
                      </label>

                      <label
                        htmlFor="scope-mobile-upload-input"
                        className="p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">画像・アルバムから選択</span>
                        <span className="text-[11px] text-slate-500">保存した写真を読み込む</span>
                      </label>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        PCのWebカメラで撮影する場合はこちら
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. AI Text Mode */}
            {addMode === 'ai_text' && !scannedResult && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  先生から連絡された範囲の連絡文やメモを貼り付けると、AIが自動で整理します。
                </p>
                <textarea
                  rows={4}
                  value={aiTextPrompt}
                  onChange={e => setAiTextPrompt(e.target.value)}
                  placeholder="例: 数学は教科書p.40〜p.85、ワークp.25〜50。単元は二次関数と図形と方程式。英語はLesson3と4の単語テスト。"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleScanScope}
                  disabled={!aiTextPrompt.trim() || isScanning}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      AIがテスト範囲を解析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AIにテスト範囲を整理してもらう
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 3. Manual Mode */}
            {addMode === 'manual' && (
              <form onSubmit={handleCreateManualSubject} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      高校教科からワンタップ選択
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">
                      タップで範囲・目標点自動入力
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    {(['数学', '理科', '英語', '国語', '地歴・公民', '情報・実技'] as const).map(cat => {
                      const subsInCat = HIGH_SCHOOL_SUBJECTS.filter(s => s.category === cat);
                      return (
                        <div key={cat} className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wide">
                            {cat}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {subsInCat.map(sub => {
                              const isSelected = manualName === sub.name;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => handleSelectPresetSubject(sub)}
                                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 border ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                                  }`}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: sub.color }}
                                  />
                                  {sub.shortName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    教科名
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="例: 数学Ⅰ・A、化学、論理・表現など"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      目標点数
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualTargetScore}
                      onChange={e => setManualTargetScore(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      教科書ページ範囲
                    </label>
                    <input
                      type="text"
                      value={manualTextbook}
                      onChange={e => setManualTextbook(e.target.value)}
                      placeholder="例: p.32〜p.78"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ワーク・提出物ページ範囲
                  </label>
                  <input
                    type="text"
                    value={manualWorkbook}
                    onChange={e => setManualWorkbook(e.target.value)}
                    placeholder="例: 基礎ワーク p.20〜p.45"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    主な単元（カンマ区切り）
                  </label>
                  <input
                    type="text"
                    value={manualTopics}
                    onChange={e => setManualTopics(e.target.value)}
                    placeholder="例: 二次関数, 図形と計量, データの分析"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddScopeModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    登録する
                  </button>
                </div>
              </form>
            )}

            {/* Confirmation Screen for Scanned/AI-Extracted Scope (「この内容で登録しますか？」) */}
            {scannedResult && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    AIがテスト範囲を読み取りました
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    誤認防止のため、以下の内容を確認してから登録してください。
                  </p>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {scannedResult.subjects.map((sub, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          {sub.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                          {sub.keyTopics?.length || 0} 単元
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <div>・教科書: {sub.textbookRange}</div>
                        <div>・ワーク: {sub.workbookRange}</div>
                        <div>・主な単元: {sub.keyTopics?.join('、 ')}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs font-bold text-amber-900">
                  「この内容で登録しますか？」
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScannedResult(null)}
                    className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    再読み取り
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAddScannedSubjects}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    この内容で登録する
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
