import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Bot, 
  X, 
  Sparkles, 
  Target, 
  GraduationCap, 
  User, 
  Check, 
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onSaveProfile
}) => {
  const [activeTab, setActiveTab] = useState<'profile_select' | 'custom_setup'>('profile_select');
  const [userName, setUserName] = useState(currentUser.name);
  const [roleTitle, setRoleTitle] = useState(currentUser.roleTitle);
  const [gradeType, setGradeType] = useState<string>(currentUser.gradeType || 'high_school');
  const [targetGoal, setTargetGoal] = useState(currentUser.targetGoal);
  const [targetScoreAverage, setTargetScoreAverage] = useState<number>(currentUser.targetScoreAverage || 80);

  if (!isOpen) return null;

  const handleSaveCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: userName || '学習者',
      roleTitle: roleTitle || 'テスト受験者',
      gradeType: gradeType as any,
      targetGoal: targetGoal || '目標点数突破！',
      targetScoreAverage
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 mb-0.5">
                NaviStudy
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                テスト前の迷子をなくす、学習ナビ
              </h2>
              <p className="text-xs text-slate-500">
                テスト範囲を整理して、勉強をもっと分かりやすく
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Clean Visual Icons Illustration */}
        <div className="py-4 px-6 bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-100">
          <div className="text-center mb-3">
            <span className="text-[11px] font-medium text-slate-500">
              迷わず合格・目標点へ導く5つのスマート機能
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-medium text-slate-700">教科書整理</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-medium text-slate-700">提出チェック</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-medium text-slate-700">カレンダー</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-medium text-slate-700">成績グラフ</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="text-[10px] font-medium text-slate-700">AIナビ</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('profile_select')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'profile_select'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            モデルアカウントを選択 (中高生・資格)
          </button>
          <button
            onClick={() => setActiveTab('custom_setup')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'custom_setup'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            学年・目標点数をカスタマイズ
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'profile_select' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  あなたの学習タイプに近いアカウントを選んで体験
                </label>
                <span className="text-[11px] text-slate-500">
                  いつでも切り替え可能
                </span>
              </div>

              <div className="grid gap-2.5">
                {allUsers.map(user => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {user.roleTitle}
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 font-medium mt-0.5 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {user.targetGoal}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> 選択中
                          </span>
                        ) : (
                          <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-medium">
                            切り替える
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Google login mock / Demo notice */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4 text-slate-400" />
                  Googleアカウント等でログイン・新規登録中
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  ✓ 自動ローカル同期中
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveCustomProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  お名前
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="例: 山田 涼太"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    学年・試験タイプ
                  </label>
                  <select
                    value={gradeType}
                    onChange={e => setGradeType(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high_school">高校生（定期考査・共通テスト）</option>
                    <option value="middle_school">中学生（定期テスト・高校受験）</option>
                    <option value="certification">資格試験（ITパスポート・英検など）</option>
                    <option value="other">その他・独学</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    所属・コース詳細
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    placeholder="例: 高校2年生 理系選抜"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  今回の目標点数（平均または目標スコア）
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="5"
                    value={targetScoreAverage}
                    onChange={e => setTargetScoreAverage(Number(e.target.value))}
                    className="flex-1 accent-blue-600 cursor-pointer"
                  />
                  <span className="w-16 text-center font-mono font-bold text-base text-blue-600 bg-blue-50 py-1 rounded-md border border-blue-200">
                    {targetScoreAverage}点
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  テストの目標スローガン
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={e => setTargetGoal(e.target.value)}
                  placeholder="例: 数学85点突破＆学年20位以内！"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  設定を保存して始める
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
