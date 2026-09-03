import { useEffect, useRef, useState } from 'react';
import { X, Calendar, Plus, Trash2, ClipboardList, Pin } from 'lucide-react';
import type { Category, Priority, Subtask, Task } from '../types/task';
import { getTodayDateString } from '../utils/dateUtils';

const PRIORITY_OPTIONS: { value: Priority; label: string; dot: string }[] = [
  { value: 'low',    label: 'Baixa',   dot: 'bg-slate-400' },
  { value: 'medium', label: 'Média',   dot: 'bg-amber-400' },
  { value: 'high',   label: 'Alta',    dot: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgente', dot: 'bg-red-500' },
];

type TaskFormData = {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string;
  subtasks: Subtask[];
  pinned: boolean;
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingTask?: Task | null;
  categories: Category[];
  initialDate?: string;
}

function TaskModalDialog({
  onClose,
  onSave,
  editingTask,
  categories,
  initialDate,
}: Omit<TaskModalProps, 'isOpen'>) {
  const titleRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<TaskFormData>(() => {
    if (editingTask) {
      return {
        title: editingTask.title,
        description: editingTask.description ?? '',
        category: editingTask.category,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        subtasks: editingTask.subtasks ?? [],
        pinned: editingTask.pinned ?? false,
      };
    }
    return {
      title: '',
      description: '',
      category: categories[0]?.id ?? 'pessoal',
      priority: 'medium',
      dueDate: initialDate || getTodayDateString(),
      subtasks: [],
      pinned: false,
    };
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  useEffect(() => {
    const timer = setTimeout(() => titleRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const setField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'O título é obrigatório.';
    if (!form.dueDate) newErrors.dueDate = 'Informe uma data de vencimento.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      completed: editingTask?.completed ?? false,
      category: form.category,
      priority: form.priority,
      dueDate: form.dueDate,
      subtasks: form.subtasks,
      pinned: form.pinned,
    });
    onClose();
  };

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setField('dueDate', `${y}-${m}-${day}`);
  };

  const addSubtask = () => {
    const text = newSubtask.trim();
    if (!text) return;
    const subtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: text,
      completed: false,
    };
    setField('subtasks', [...form.subtasks, subtask]);
    setNewSubtask('');
  };

  const removeSubtask = (id: string) => {
    setField('subtasks', form.subtasks.filter((s) => s.id !== id));
  };

  const isEdit = !!editingTask;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 id="task-modal-title" className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEdit ? 'Editar tarefa' : 'Nova tarefa'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="btn-ghost p-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              placeholder="O que precisa ser feito?"
              maxLength={200}
              className={`input-base ${errors.title ? 'border-red-400 focus:ring-red-400/40 focus:border-red-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Adicione mais detalhes..."
              rows={3}
              maxLength={1000}
              className="input-base resize-none"
            />
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                id="task-category"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className="input-base cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prioridade
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => setField('priority', e.target.value as Priority)}
                className="input-base cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-due" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Calendar className="inline-block w-4 h-4 mr-1 opacity-60" />
                Data de vencimento <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Amanhã
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  +7 dias
                </button>
              </div>
            </div>
            <input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              className={`input-base ${errors.dueDate ? 'border-red-400' : ''}`}
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Pin task checkbox */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <input
              id="task-pinned"
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setField('pinned', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <label htmlFor="task-pinned" className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <Pin className={`w-3.5 h-3.5 ${form.pinned ? 'text-amber-500 fill-amber-500/20 -rotate-45' : 'text-slate-400'}`} />
              Fixar esta tarefa no topo da lista
            </label>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subtarefas
              <span className="ml-2 text-xs font-normal text-slate-400">({form.subtasks.length})</span>
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                placeholder="Adicionar subtarefa..."
                maxLength={200}
                className="input-base flex-1"
              />
              <button onClick={addSubtask} className="btn-secondary px-3" aria-label="Adicionar subtarefa">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {form.subtasks.length > 0 && (
              <ul className="space-y-1.5">
                {form.subtasks.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg
                      bg-slate-50 dark:bg-slate-800/50 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0" />
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">{s.title}</span>
                    <button
                      onClick={() => removeSubtask(s.id)}
                      aria-label="Remover subtarefa"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400
                        hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-primary">
            {isEdit ? 'Salvar alterações' : 'Criar tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TaskModal(props: TaskModalProps) {
  if (!props.isOpen) return null;
  return (
    <TaskModalDialog
      key={props.editingTask ? props.editingTask.id : `new-task-${props.initialDate || ''}`}
      onClose={props.onClose}
      onSave={props.onSave}
      editingTask={props.editingTask}
      categories={props.categories}
      initialDate={props.initialDate}
    />
  );
}
