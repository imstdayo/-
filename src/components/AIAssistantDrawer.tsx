import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  User, 
  BookOpen, 
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { ChatMessage, TestScope, SubmissionDeadline, UserProfile } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  testScope: TestScope;
  deadlines: SubmissionDeadline[];
  currentUser: UserProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  testScope,
  deadlines,
  currentUser,
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `こんにちは！専属学習アドバイザーAIです👋
「${testScope.title}」に向けて、テスト範囲の整理・提出期限の優先順位・教科ごとの効率的な勉強法など、何でも相談してくださいね！`,
      timestamp: 'たった今'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      // Build context of user's current situation
      const context = {
        userName: currentUser.name,
        targetGoal: currentUser.targetGoal,
        testTitle: testScope.title,
        startDate: testScope.startDate,
        endDate: testScope.endDate,
        subjects: testScope.subjects.map(s => ({
          name: s.name,
          targetScore: s.targetScore,
          currentScore: s.currentScore,
          textbookRange: s.textbookRange,
          workbookRange: s.workbookRange,
          uncompletedTasks: s.items.filter(i => !i.completed).map(i => i.title),
          estimatedHours: s.aiEstimatedHours
        })),
        pendingDeadlines: deadlines.filter(d => !d.completed).map(d => ({
          title: d.title,
          subject: d.subjectName,
          dueDate: d.dueDate,
          dueTime: d.dueTime
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

      if (!res.ok) {
        throw new Error('AIの応答取得に失敗しました');
      }

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: 'reply_' + Date.now(),
        role: 'assistant',
        content: data.reply || '回答を受信できませんでした。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: '申し訳ありません、通信に一時的な問題が発生しました。もう一度お試しください。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    '提出期限が迫っている課題の最優先順序を教えて',
    '提出ワークの範囲を最短で終わらせるコツは？',
    'テスト3日前の効果的な復習ルーティンは？',
    'やる気が出ない時の15分ポモドーロ勉強法は？'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                専属AI学習アシスタント
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </h3>
              <p className="text-[11px] text-slate-500">
                テスト範囲・提出物・効率的な勉強法をサポート
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isAI
                      ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                      : 'bg-blue-600 text-white rounded-tr-sm font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[9px] block text-right mt-1 ${isAI ? 'text-slate-400' : 'text-blue-200'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold">
                AI
              </div>
              <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>回答を考えています…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1.5">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>よくある質問:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="px-2.5 py-1 rounded-full text-[11px] bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 shrink-0 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="AIに勉強の進め方を質問する..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={isSending}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 text-xs focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
