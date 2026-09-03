import type { Category, Task } from '../types/task';
import { INITIAL_CATEGORIES, getInitialTasks } from './mockData';

const BASE_KEYS = {
  TASKS: 'atg_todo_tasks_v1',
  CATEGORIES: 'atg_todo_categories_v1',
  THEME: 'atg_todo_theme_v1',
};

function getTasksKey(userId?: string): string {
  return userId ? `${BASE_KEYS.TASKS}_${userId}` : BASE_KEYS.TASKS;
}

function getCategoriesKey(userId?: string): string {
  return userId ? `${BASE_KEYS.CATEGORIES}_${userId}` : BASE_KEYS.CATEGORIES;
}

export function loadTasksFromStorage(userId?: string): Task[] {
  try {
    const key = getTasksKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Se não tem nada para este usuário específico, se for chave global pega mock, se for usuário retorna vazio para carregar do Supabase
      if (!userId) {
        const initial = getInitialTasks();
        saveTasksToStorage(initial);
        return initial;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler tarefas do localStorage:', err);
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[], userId?: string): void {
  try {
    const key = getTasksKey(userId);
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (err) {
    console.error('Erro ao salvar tarefas no localStorage:', err);
  }
}

export function loadCategoriesFromStorage(userId?: string): Category[] {
  try {
    const key = getCategoriesKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveCategoriesToStorage(INITIAL_CATEGORIES, userId);
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch (err) {
    console.error('Erro ao carregar categorias do localStorage:', err);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategoriesToStorage(categories: Category[], userId?: string): void {
  try {
    const key = getCategoriesKey(userId);
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (err) {
    console.error('Erro ao salvar categorias no localStorage:', err);
  }
}

export function exportDataAsJson(tasks: Task[], categories: Category[]): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    tasks,
    categories,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_tarefas_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  tasks: Task[];
  categories: Category[];
}

export function parseImportJson(jsonString: string): ImportResult | null {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return null;

    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const categories = Array.isArray(data.categories) ? data.categories : INITIAL_CATEGORIES;

    return { tasks, categories };
  } catch {
    return null;
  }
}
