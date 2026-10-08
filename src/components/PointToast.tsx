import React, { useEffect } from 'react';
import { Sparkles, X, Flame } from 'lucide-react';

export interface PointToastItem {
  id: string;
  points: number;
  title: string;
  subtitle?: string;
}

interface PointToastContainerProps {
  toasts: PointToastItem[];
  onClose: (id: string) => void;
}

export const PointToastContainer: React.FC<PointToastContainerProps> = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <SingleToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
};

const SingleToastItem: React.FC<{ toast: PointToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="pointer-events-auto bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-amber-300/50 flex items-center gap-3 animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="w-10 h-10 rounded-xl bg-white/95 text-amber-600 flex items-center justify-center font-black text-xl shadow-xs shrink-0 animate-bounce">
        ⭐
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-black tracking-tight font-mono">
            +{toast.points} pt
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-white/25 text-white">
            GET!
          </span>
        </div>
        <p className="text-xs font-bold text-white truncate">
          {toast.title}
        </p>
        {toast.subtitle && (
          <p className="text-[10px] text-amber-100 truncate opacity-90">
            {toast.subtitle}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition shrink-0 cursor-pointer"
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Also export single PointToast for backward compatibility
export const PointToast: React.FC<{
  event: { points: number; label: string } | null;
  onClose: () => void;
}> = ({ event, onClose }) => {
  if (!event) return null;
  return (
    <PointToastContainer
      toasts={[{ id: 'single_toast', points: event.points, title: event.label }]}
      onClose={onClose}
    />
  );
};
