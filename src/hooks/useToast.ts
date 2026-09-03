import { useCallback, useState } from 'react';
import type { Toast, ToastType } from '../types/task';

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (params: {
      type: ToastType;
      message: string;
      description?: string;
      undoAction?: () => void;
      duration?: number;
    }): string => {
      const id = generateId();
      const toast: Toast = { id, ...params, duration: params.duration ?? (params.undoAction ? 5000 : 3500) };
      setToasts((prev) => [...prev.slice(-4), toast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
