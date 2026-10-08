import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  User, 
  Lightbulb, 
  Clock, 
  BookOpen, 
  Target,
  ArrowRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ChatMessage, TestScope, SubmissionDeadline, UserProfile, DailyStudyTask } from '../types';

interface AIAssistantViewProps {
  testScope: TestScope;
  deadlines: SubmissionDeadline[];
  currentUser: UserProfile;
  dailyTasks: DailyStudyTask[];
  onNavigateTab: (tab: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  testScope,
  deadlines,
  currentUser,
  dailyTasks,
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_ai',
      role: 'assistant',
      content: `こんにちは、${currentUser.name}さん！専属学習ナビゲーションAIです👋
「${testScope.title}」の目標達成に向けて、テスト範囲・提出物・あなた専用の学習時間を整理してサポートします。

下の質問例をクリックするか、自由に質問を入力してくださいね！`,
      timestamp: 'たった今'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Specific user prompt suggestions matching specification:
  // - 今日何を勉強すればいい？
  // - 数学の勉強時間を増やしたい
  // - 提出期限が近い課題を教えて
  // - 目標点数に必要な勉強時間を計算して
  // - このテスト範囲を整理して
  // - 苦手なところを優先順位順にして
  const promptSuggestions = [
    { text: '今日何を勉強すればいい？', icon: Lightbulb },
    { text: '数学の勉強時間を増やしたい', icon: Clock },
    { text: '提出期限が近い課題を教えて', icon: Calendar },
    { text: '目標点数に必要な勉強時間を計算して', icon: Target },
    { text: 'このテスト範囲を整理して', icon: BookOpen },
    { text: '苦手なところを優先順位順にして', icon: Sparkles }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      // Build rich context with actual student data
      const context = {
        userName: currentUser.name,
        targetGoal: currentUser.targetGoal,
        grade: currentUser.grade,
        totalStudyMinutes: currentUser.totalStudyMinutes,
        testTitle: testScope.title,
        startDate: testScope.startDate,
        todayTasks: dailyTasks.map(t => ({
          subject: t.subjectName,
          topic: t.topic,
          minutes: t.estimatedMinutes,
          completed: t.completed
        })),
        subjects: testScope.subjects.map(s => ({
          name: s.name,
          targetScore: s.targetScore,
          currentScore: s.currentScore,
          textbookRange: s.textbookRange,
          workbookRange: s.workbookRange,
          keyTopics: s.keyTopics,
          weaknesses: s.items.filter(i => i.masteryLevel === 'shaky').map(i => i.title),
          uncompletedCount: s.items.filter(i => !i.completed).length,
          aiEstimatedHours: s.aiEstimatedHours
        })),
        pendingDeadlines: deadlines.filter(d => !d.completed).map(d => ({
          title: d.title,
          subject: d.subjectName,
          dueDate: d.dueDate
        }))
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context
        })
      });

      if (!res.ok) throw new Error('AI response error');

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: 'reply_' + Date.now(),
        role: 'assistant',
        content: data.reply || '回答を受信できませんでした。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: '申し訳ありません。通信に失敗しました。もう一度送信してください。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI学習アシスタント
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            データ連動ナビ
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          登録されたテスト範囲・提出期限・勉強時間データを元に、AIが最適な学習順序を案内します
        </p>
      </div>

      {/* 2. 質問例（上部に配置） */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>よくある質問・おすすめの相談（タップですぐに質問できます）:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {promptSuggestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.text)}
                disabled={isSending}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 text-left transition flex items-center gap-2 text-xs font-semibold text-slate-800 disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. チャット履歴エリア */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-100/90 text-slate-800 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm font-medium shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] block text-right mt-1.5 font-mono ${isAI ? 'text-slate-400' : 'text-blue-200'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    私
                  </div>
                )}
              </div>
            );
          })}
          {isSending && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-xs text-slate-500 rounded-tl-sm flex items-center gap-2">
                <span>あなたの学習データを分析中...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 4. 画面下の入力欄 */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="テスト勉強の相談、提出期限の優先度、効率的な暗記法などを質問..."
            className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>送信</span>
          </button>
        </form>
      </div>
    </div>
  );
};
