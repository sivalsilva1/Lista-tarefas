/**
 * Serviço de sincronização com o Supabase.
 * Responsável por traduzir entre o formato da DB (snake_case) e o modelo TS (camelCase)
 * e garantir que cada operação esteja vinculada ao user_id autenticado.
 */
import { supabase } from '../lib/supabase';
import type { Category, Task } from '../types/task';

// ── Tipos internos do banco (snake_case) ───────────────────────────────────

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  priority: string;
  due_date: string | null;
  tags: string[];
  subtasks: Task['subtasks'];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

// ── Conversores ────────────────────────────────────────────────────────────

function dbToTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    category: row.category,
    priority: row.priority as Task['priority'],
    dueDate: row.due_date ?? '',
    subtasks: row.subtasks ?? [],
    pinned: row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function taskToDb(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string
): Omit<DbTask, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId || '',
    title: task.title,
    description: task.description ?? '',
    completed: task.completed,
    category: task.category,
    priority: task.priority,
    due_date: task.dueDate || null,
    tags: [],
    subtasks: task.subtasks ?? [],
    pinned: task.pinned ?? false,
  };
}

function dbToCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    bgLight: '',
    textLight: '',
    bgDark: '',
    textDark: '',
  };
}

// ── Funções de Apoio de Usuário ────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  return user.id;
}

/** Vincula tarefas/categorias órfãs ao primeiro usuário que logar */
export async function adoptOrphanData(): Promise<void> {
  try {
    await supabase.rpc('adopt_orphan_data');
  } catch (err) {
    console.warn('[Supabase] Erro ao tentar adotar dados órfãos:', err);
  }
}

// ── API: Tarefas ───────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbTask[]).map(dbToTask);
}

export async function insertTask(task: Task): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    ...taskToDb(task, userId),
  });
  if (error) throw error;
}

export async function upsertTask(task: Task): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('tasks').upsert({
    id: task.id,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    ...taskToDb(task, userId),
  });
  if (error) throw error;
}

export async function updateTaskInDb(id: string, updates: Partial<Task>): Promise<void> {
  const payload: Partial<DbTask> & { updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.completed !== undefined) payload.completed = updates.completed;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;
  if (updates.subtasks !== undefined) payload.subtasks = updates.subtasks;
  if (updates.pinned !== undefined) payload.pinned = updates.pinned;

  const { error } = await supabase.from('tasks').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTaskFromDb(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteTasksBulk(ids: string[]): Promise<void> {
  const { error } = await supabase.from('tasks').delete().in('id', ids);
  if (error) throw error;
}

// ── API: Categorias ────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as DbCategory[]).map(dbToCategory);
}

export async function upsertCategory(cat: Category): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('categories').upsert({
    id: cat.id,
    user_id: userId,
    name: cat.name,
    color: cat.color,
  });
  if (error) throw error;
}

export async function deleteCategoryFromDb(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
