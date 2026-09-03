import { useState } from 'react';
import { Plus, Calendar, Flag, Sliders } from 'lucide-react';
import type { Category, Priority, Task } from '../types/task';

interface QuickAddTaskProps {
  categories: Category[];
  onCreateTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onOpenFullModal: () => void;
}

export function QuickAddTask({ categories, onCreateTask, onOpenFullModal }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id ?? 'pessoal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDateType, setDueDateType] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateDueDate = (type: 'today' | 'tomorrow' | 'week'): string => {
    const today = new Date();
    if (type === 'tomorrow') {
      today.setDate(today.getDate() + 1);
    } else if (type === 'week') {
      today.setDate(today.getDate() + 7);
    }
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onCreateTask({
      title: cleanTitle,
      category,
      priority,
      dueDate: calculateDueDate(dueDateType),
      completed: false,
    });

    setTitle('');
  };

  return (
    <div
      className={`card transition-all duration-200 border border-slate-200 dark:border-slate-800
        ${isExpanded ? 'shadow-md ring-2 ring-indigo-500/20 dark:ring-indigo-400/20' : 'shadow-sm'}
        p-3 sm:p-4`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>

          <input
            id="quick-task-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Adicionar tarefa rápida... (pressione Enter para salvar)"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            maxLength={200}
          />

          <button
            type="button"
            onClick={onOpenFullModal}
            title="Abrir formulário completo com subtarefas e descrição"
            className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Completo</span>
          </button>

          <button
            type="submit"
            disabled={!title.trim()}
            className="btn-primary text-xs px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Adicionar
          </button>
        </div>

        {/* Quick option selectors (shown when active or has text) */}
        {(isExpanded || title.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in text-xs">
            {/* Due date shortcuts */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
                <Calendar className="w-3 h-3" />
                Vencimento:
              </span>
              {(
                [
                  { id: 'today', label: 'Hoje' },
                  { id: 'tomorrow', label: 'Amanhã' },
                  { id: 'week', label: '+7 dias' },
                ] as const
              ).map((dt) => (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setDueDateType(dt.id)}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    dueDateType === dt.id
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {dt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Category picker */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Priority picker */}
              <div className="flex items-center gap-1">
                <Flag className="w-3 h-3 text-slate-400" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
