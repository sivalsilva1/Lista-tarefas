import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category, FilterState, StatusCounts, Task, TaskStats } from '../types/task';
import {
  exportDataAsJson,
  loadCategoriesFromStorage,
  loadTasksFromStorage,
  parseImportJson,
  saveCategoriesToStorage,
  saveTasksToStorage,
} from '../utils/storage';
import {
  fetchTasks,
  fetchCategories,
  insertTask,
  updateTaskInDb,
  deleteTaskFromDb,
  deleteTasksBulk,
  upsertCategory,
  deleteCategoryFromDb,
  adoptOrphanData,
} from '../utils/supabaseService';
import { isOverdue, isDueToday } from '../utils/dateUtils';
import { INITIAL_CATEGORIES, getInitialTasks } from '../utils/mockData';

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: 'all',
  category: 'all',
  priority: 'all',
  sortBy: 'dueDateAsc',
};

export function useTasks(userId?: string) {
  // Carrega do localStorage do usuário como estado inicial
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage(userId));
  const [categories, setCategories] = useState<Category[]>(() => loadCategoriesFromStorage(userId));
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncingRef = useRef(false);

  // ── Sincronização inicial com o Supabase ────────────────────────────────────

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    async function loadFromSupabase() {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setIsSyncing(true);
      setSyncError(null);

      try {
        // Tenta adotar dados órfãos se existirem (ex: dados criados antes da autenticação)
        await adoptOrphanData();

        const [remoteTasks, remoteCategories] = await Promise.all([
          fetchTasks(),
          fetchCategories(),
        ]);

        if (!isMounted) return;

        // Se o usuário não tem tarefas no Supabase, verificar se há dados iniciais para criar
        if (remoteTasks.length === 0) {
          const initialTasks = getInitialTasks();
          await Promise.all(initialTasks.map((t) => insertTask(t)));
          if (isMounted) {
            setTasks(initialTasks);
            saveTasksToStorage(initialTasks, userId);
          }
        } else {
          if (isMounted) {
            setTasks(remoteTasks);
            saveTasksToStorage(remoteTasks, userId);
          }
        }

        // Categorias
        if (remoteCategories.length === 0) {
          const localCats = loadCategoriesFromStorage(userId);
          await Promise.all(localCats.map((c) => upsertCategory(c)));
          if (isMounted) {
            setCategories(localCats);
          }
        } else {
          const localCats = loadCategoriesFromStorage(userId);
          const localMap = new Map(localCats.map((c) => [c.id, c]));
          const merged = remoteCategories.map((rc) => ({
            ...(localMap.get(rc.id) ?? rc),
            id: rc.id,
            name: rc.name,
            color: rc.color,
          }));
          if (isMounted) {
            setCategories(merged);
            saveCategoriesToStorage(merged, userId);
          }
        }
      } catch (err) {
        console.error('[Supabase] Erro ao carregar dados:', err);
        if (isMounted) {
          setSyncError('Falha ao conectar ao Supabase. Usando dados locais.');
          // Carrega do cache local
          setTasks(loadTasksFromStorage(userId));
          setCategories(loadCategoriesFromStorage(userId));
        }
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
        syncingRef.current = false;
      }
    }

    loadFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // ── Persistência local (cache offline) ────────────────────────────────────

  useEffect(() => {
    if (userId) {
      saveTasksToStorage(tasks, userId);
    }
  }, [tasks, userId]);

  useEffect(() => {
    if (userId) {
      saveCategoriesToStorage(categories, userId);
    }
  }, [categories, userId]);

  // ── CRUD Tasks ─────────────────────────────────────────────────────────────

  const createTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [newTask, ...prev]);

    // Sincroniza com Supabase em background
    insertTask(newTask).catch((err) => {
      console.error('[Supabase] Erro ao criar tarefa:', err);
    });

    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      )
    );

    updateTaskInDb(id, updates).catch((err) => {
      console.error('[Supabase] Erro ao atualizar tarefa:', err);
    });
  }, []);

  const deleteTask = useCallback((id: string): Task | undefined => {
    let deleted: Task | undefined;
    setTasks((prev) => {
      deleted = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });

    deleteTaskFromDb(id).catch((err) => {
      console.error('[Supabase] Erro ao deletar tarefa:', err);
    });

    return deleted;
  }, []);

  const restoreTask = useCallback((task: Task): void => {
    setTasks((prev) => {
      if (prev.some((t) => t.id === task.id)) return prev;
      return [task, ...prev];
    });

    insertTask(task).catch((err) => {
      console.error('[Supabase] Erro ao restaurar tarefa:', err);
    });
  }, []);

  const toggleComplete = useCallback((id: string): void => {
    let newCompleted = false;
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        newCompleted = !t.completed;
        return { ...t, completed: newCompleted, updatedAt: new Date().toISOString() };
      });
      return updated;
    });

    setTimeout(() => {
      updateTaskInDb(id, { completed: newCompleted }).catch((err) => {
        console.error('[Supabase] Erro ao alternar conclusão:', err);
      });
    }, 0);
  }, []);

  const togglePin = useCallback((id: string): void => {
    let newPinned = false;
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        newPinned = !t.pinned;
        return { ...t, pinned: newPinned, updatedAt: new Date().toISOString() };
      });
      return updated;
    });

    setTimeout(() => {
      updateTaskInDb(id, { pinned: newPinned }).catch((err) => {
        console.error('[Supabase] Erro ao fixar tarefa:', err);
      });
    }, 0);
  }, []);

  const addSubtaskToTask = useCallback((taskId: string, title: string): void => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const newSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: cleanTitle,
      completed: false,
    };

    let updatedSubtasks: Task['subtasks'] = [];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        updatedSubtasks = [...(t.subtasks ?? []), newSubtask];
        return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
      })
    );

    updateTaskInDb(taskId, { subtasks: updatedSubtasks }).catch((err) => {
      console.error('[Supabase] Erro ao adicionar subtarefa:', err);
    });
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string): void => {
    let updatedSubtasks: Task['subtasks'] = [];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        updatedSubtasks = (t.subtasks ?? []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
      })
    );

    updateTaskInDb(taskId, { subtasks: updatedSubtasks }).catch((err) => {
      console.error('[Supabase] Erro ao alternar subtarefa:', err);
    });
  }, []);

  const deleteAllCompleted = useCallback((): Task[] => {
    let removed: Task[] = [];
    setTasks((prev) => {
      removed = prev.filter((t) => t.completed);
      return prev.filter((t) => !t.completed);
    });

    if (removed.length > 0) {
      deleteTasksBulk(removed.map((t) => t.id)).catch((err) => {
        console.error('[Supabase] Erro ao deletar tarefas concluídas:', err);
      });
    }

    return removed;
  }, []);

  const bulkRestoreTasks = useCallback((toRestore: Task[]): void => {
    setTasks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newOnes = toRestore.filter((t) => !existingIds.has(t.id));
      return [...newOnes, ...prev];
    });

    Promise.all(toRestore.map((t) => insertTask(t))).catch((err) => {
      console.error('[Supabase] Erro ao restaurar tarefas em lote:', err);
    });
  }, []);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  const addCategory = useCallback((cat: Category): void => {
    setCategories((prev) => [...prev, cat]);
    upsertCategory(cat).catch((err) => {
      console.error('[Supabase] Erro ao criar categoria:', err);
    });
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>): void => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    setCategories((current) => {
      const cat = current.find((c) => c.id === id);
      if (cat) {
        upsertCategory(cat).catch((err) => {
          console.error('[Supabase] Erro ao atualizar categoria:', err);
        });
      }
      return current;
    });
  }, []);

  const deleteCategory = useCallback((id: string): void => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) =>
      prev.map((t) =>
        t.category === id ? { ...t, category: 'pessoal', updatedAt: new Date().toISOString() } : t
      )
    );

    deleteCategoryFromDb(id).catch((err) => {
      console.error('[Supabase] Erro ao deletar categoria:', err);
    });
  }, []);

  // ── Filters ────────────────────────────────────────────────────────────────

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ── Derived: filtered + sorted tasks ──────────────────────────────────────

  const filteredTasks = (() => {
    let result = tasks.filter((t) => {
      if (filters.status === 'completed' && !t.completed) return false;
      if (filters.status === 'pending' && t.completed) return false;
      if (filters.status === 'overdue' && !(isOverdue(t.dueDate, t.completed))) return false;
      if (filters.status === 'today' && !(isDueToday(t.dueDate) && !t.completed)) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = (t.description ?? '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });

    const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

    result.sort((a, b) => {
      const aPinned = !!a.pinned && !a.completed;
      const bPinned = !!b.pinned && !b.completed;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      switch (filters.sortBy) {
        case 'priorityDesc':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'priorityAsc':
          return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        case 'dueDateDesc':
          return (b.dueDate || '').localeCompare(a.dueDate || '');
        case 'titleAsc':
          return a.title.localeCompare(b.title, 'pt-BR');
        case 'createdAtDesc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'dueDateAsc':
        default:
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
      }
    });

    return result;
  })();

  // ── Computed stats ─────────────────────────────────────────────────────────

  const stats: TaskStats = (() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length;
    const dueToday = tasks.filter((t) => isDueToday(t.dueDate) && !t.completed).length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const categoryMap = new Map<string, number>();
    tasks.forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + 1);
    });
    const categoryDistribution = categories
      .map((c) => ({
        category: c.name,
        count: categoryMap.get(c.id) ?? 0,
        color: c.color,
      }))
      .filter((c) => c.count > 0);

    const priorityMap: Record<string, number> = {};
    tasks.forEach((t) => {
      priorityMap[t.priority] = (priorityMap[t.priority] ?? 0) + 1;
    });
    const priorityDistribution = (['urgent', 'high', 'medium', 'low'] as const).map((p) => ({
      priority: p,
      count: priorityMap[p] ?? 0,
    }));

    return {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      completionRate,
      categoryDistribution,
      priorityDistribution,
    };
  })();

  const statusCounts: StatusCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length,
    today: tasks.filter((t) => isDueToday(t.dueDate) && !t.completed).length,
  };

  // ── Backup helpers ─────────────────────────────────────────────────────────

  const exportData = useCallback(() => {
    exportDataAsJson(tasks, categories);
  }, [tasks, categories]);

  const importData = useCallback((jsonString: string): boolean => {
    const result = parseImportJson(jsonString);
    if (!result) return false;
    setTasks(result.tasks);
    setCategories(result.categories.length > 0 ? result.categories : INITIAL_CATEGORIES);
    return true;
  }, []);

  const resetToDemo = useCallback(() => {
    const initialTasks = getInitialTasks();
    setTasks(initialTasks);
    setCategories(INITIAL_CATEGORIES);
    if (userId) {
      saveTasksToStorage(initialTasks, userId);
      saveCategoriesToStorage(INITIAL_CATEGORIES, userId);
    }
  }, [userId]);

  return {
    tasks,
    filteredTasks,
    categories,
    filters,
    stats,
    statusCounts,
    isSyncing,
    syncError,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleComplete,
    togglePin,
    toggleSubtask,
    addSubtaskToTask,
    deleteAllCompleted,
    bulkRestoreTasks,
    addCategory,
    updateCategory,
    deleteCategory,
    setFilter,
    resetFilters,
    exportData,
    importData,
    resetToDemo,
  };
}
