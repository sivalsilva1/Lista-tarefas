/**
 * Utilitários para manipulação e formatação de datas em pt-BR
 */

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDatePtBr(dateStr: string): string {
  if (!dateStr) return '';
  // Se for YYYY-MM-DD, divide para evitar problemas com fuso horário UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTimePtBr(isoStr: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isDueToday(dueDate: string): boolean {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) === getTodayDateString();
}

export function isOverdue(dueDate: string, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const todayStr = getTodayDateString();
  return dueDate.slice(0, 10) < todayStr;
}

export function isDueSoon(dueDate: string, completed: boolean, daysAhead = 3): boolean {
  if (!dueDate || completed) return false;
  const todayStr = getTodayDateString();
  const targetStr = dueDate.slice(0, 10);
  
  if (targetStr < todayStr) return false;
  
  const today = new Date(todayStr + 'T00:00:00');
  const target = new Date(targetStr + 'T00:00:00');
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= daysAhead;
}

export interface DueStatusInfo {
  label: string;
  variant: 'danger' | 'warning' | 'info' | 'success' | 'muted';
  isUrgent: boolean;
}

export function getDueStatus(dueDate: string, completed: boolean): DueStatusInfo {
  if (!dueDate) {
    return { label: 'Sem prazo', variant: 'muted', isUrgent: false };
  }

  if (completed) {
    return { label: `Concluída (${formatDatePtBr(dueDate)})`, variant: 'success', isUrgent: false };
  }

  const todayStr = getTodayDateString();
  const dateOnly = dueDate.slice(0, 10);

  if (dateOnly < todayStr) {
    const today = new Date(todayStr + 'T00:00:00');
    const target = new Date(dateOnly + 'T00:00:00');
    const daysLate = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    return {
      label: `Atrasada há ${daysLate} ${daysLate === 1 ? 'dia' : 'dias'}`,
      variant: 'danger',
      isUrgent: true,
    };
  }

  if (dateOnly === todayStr) {
    return {
      label: 'Vence hoje!',
      variant: 'warning',
      isUrgent: true,
    };
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  if (dateOnly === tomorrowStr) {
    return {
      label: 'Vence amanhã',
      variant: 'info',
      isUrgent: false,
    };
  }

  return {
    label: formatDatePtBr(dueDate),
    variant: 'muted',
    isUrgent: false,
  };
}
