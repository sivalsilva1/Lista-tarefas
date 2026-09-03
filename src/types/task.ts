export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: Priority;
  dueDate: string; // Formato YYYY-MM-DD
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  subtasks?: Subtask[];
  pinned?: boolean;
}

export interface StatusCounts {
  all: number;
  pending: number;
  completed: number;
  overdue: number;
  today: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  textLight: string;
  bgDark: string;
  textDark: string;
  icon?: string;
}

export type FilterStatus = 'all' | 'pending' | 'completed' | 'overdue' | 'today';

export type SortOption =
  | 'dueDateAsc'
  | 'dueDateDesc'
  | 'priorityDesc'
  | 'priorityAsc'
  | 'createdAtDesc'
  | 'titleAsc';

export interface FilterState {
  search: string;
  status: FilterStatus;
  category: string; // 'all' ou ID/nome da categoria
  priority: string; // 'all' ou Priority
  sortBy: SortOption;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  categoryDistribution: { category: string; count: number; color: string }[];
  priorityDistribution: { priority: Priority; count: number }[];
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  undoAction?: () => void;
  duration?: number;
}
