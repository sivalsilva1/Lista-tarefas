import { useEffect } from 'react';

interface KeyboardShortcuts {
  onNewTask: () => void;
  onFocusSearch: () => void;
  onToggleDashboard: () => void;
  onToggleCalendar?: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcuts,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focused on inputs/textareas
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        shortcuts.onEscape();
        return;
      }

      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        shortcuts.onNewTask();
      } else if (e.key === '/' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        shortcuts.onFocusSearch();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        shortcuts.onToggleDashboard();
      } else if (e.key === 'c' || e.key === 'C') {
        if (shortcuts.onToggleCalendar) {
          e.preventDefault();
          shortcuts.onToggleCalendar();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
