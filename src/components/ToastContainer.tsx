import { useEffect } from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X, Undo2 } from 'lucide-react';
import type { Toast } from '../types/task';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  info:    <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
};

const PROGRESS_COLORS = {
  success: 'bg-emerald-500',
  info:    'bg-indigo-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const duration = toast.duration ?? 3500;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  const handleUndo = () => {
    toast.undoAction?.();
    onRemove(toast.id);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="animate-slide-right relative flex items-start gap-3 w-full max-w-sm
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        rounded-2xl shadow-xl overflow-hidden py-4 pl-4 pr-3"
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          {toast.message}
        </p>
        {toast.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.undoAction && (
          <button
            onClick={handleUndo}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold
              text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300
              transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Desfazer
          </button>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Fechar notificação"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full ${PROGRESS_COLORS[toast.type]}`}
          style={{ animation: `shimmer ${duration}ms linear forwards`, width: '100%',
            transformOrigin: 'left' }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificações"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
