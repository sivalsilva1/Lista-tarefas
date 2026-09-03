import { useState } from 'react';
import {
  Check, Pencil, Trash2, Calendar, ChevronDown, ChevronUp, Flag,
  MoreVertical, AlertCircle, Pin, Plus
} from 'lucide-react';
import type { Category, Task } from '../types/task';
import { getDueStatus } from '../utils/dateUtils';

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgente',
  high:   'Alta',
  medium: 'Média',
  low:    'Baixa',
};

const PRIORITY_BAR_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-400',
};

const PRIORITY_BADGE_CLASSES: Record<string, string> = {
  urgent: 'badge-urgent',
  high:   'badge-high',
  medium: 'badge-medium',
  low:    'badge-low',
};

interface TaskCardProps {
  task: Task;
  categories: Category[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onTogglePin?: (id: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
}

export function TaskCard({
  task,
  categories,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onTogglePin,
  onAddSubtask,
}: TaskCardProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const category = categories.find((c) => c.id === task.category);
  const dueStatus = getDueStatus(task.dueDate, task.completed);

  const completedSubtasks = (task.subtasks ?? []).filter((s) => s.completed).length;
  const totalSubtasks = (task.subtasks ?? []).length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const isOverdueCard = dueStatus.variant === 'danger';

  const DUE_STATUS_CLASSES: Record<typeof dueStatus.variant, string> = {
    danger:  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
    info:    'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
    muted:   'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
  };

  return (
    <article
      className={`card group relative flex overflow-hidden
        ${task.completed ? 'opacity-75' : ''}
        ${isOverdueCard && !task.completed ? 'border-red-200 dark:border-red-800/60' : ''}
      `}
      aria-label={`Tarefa: ${task.title}${task.completed ? ' — concluída' : ''}`}
    >
      {/* Priority bar */}
      <div className={`w-1 flex-shrink-0 ${PRIORITY_BAR_COLORS[task.priority]} rounded-l-2xl transition-all`} />

      <div className="flex-1 p-4 min-w-0">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
            className={`task-checkbox mt-0.5 flex-shrink-0 flex items-center justify-center
              ${task.completed ? 'completed' : ''}`}
          >
            {task.completed && (
              <Check className="w-3 h-3 text-white animate-check-bounce" strokeWidth={3} />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-sm leading-snug
                ${task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
                }`}
            >
              {task.title}
            </h3>

            {task.description && !task.completed && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {/* Pinned badge */}
              {task.pinned && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                  <Pin className="w-3 h-3 fill-amber-500/20 -rotate-45" />
                  Fixada
                </span>
              )}

              {/* Category badge */}
              {category && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border
                    ${category.bgLight} ${category.bgDark}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: category.color }}
                  />
                  {category.name}
                </span>
              )}

              {/* Priority badge */}
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
                <Flag className="w-3 h-3" />
                {PRIORITY_LABELS[task.priority]}
              </span>

              {/* Due date badge */}
              {task.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border
                    ${DUE_STATUS_CLASSES[dueStatus.variant]}`}
                >
                  {dueStatus.isUrgent && <AlertCircle className="w-3 h-3" />}
                  {!dueStatus.isUrgent && <Calendar className="w-3 h-3" />}
                  {dueStatus.label}
                </span>
              )}
            </div>

            {/* Subtask progress */}
            {totalSubtasks > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowSubtasks((v) => !v)}
                  aria-expanded={showSubtasks}
                  className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400
                    hover:text-slate-700 dark:hover:text-slate-300 transition-colors group/sub cursor-pointer"
                >
                  {showSubtasks
                    ? <ChevronUp className="w-3.5 h-3.5" />
                    : <ChevronDown className="w-3.5 h-3.5" />
                  }
                  <span>{completedSubtasks}/{totalSubtasks} subtarefas</span>
                  {/* Mini progress bar */}
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 max-w-24 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                </button>

                {showSubtasks && (
                  <div className="mt-2 pl-1 animate-slide-down space-y-2">
                    <ul className="space-y-1.5">
                      {(task.subtasks ?? []).map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleSubtask(task.id, s.id)}
                            aria-label={s.completed ? 'Desmarcar subtarefa' : 'Marcar subtarefa'}
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                              transition-all duration-150 cursor-pointer
                              ${s.completed
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                              }`}
                          >
                            {s.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                          </button>
                          <span className={`text-xs leading-relaxed
                            ${s.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {s.title}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Quick subtask add input */}
                    {onAddSubtask && (
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newSubtaskTitle.trim()) {
                                onAddSubtask(task.id, newSubtaskTitle.trim());
                                setNewSubtaskTitle('');
                              }
                            }
                          }}
                          placeholder="Adicionar subtarefa... (Enter)"
                          maxLength={200}
                          className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSubtaskTitle.trim()) {
                              onAddSubtask(task.id, newSubtaskTitle.trim());
                              setNewSubtaskTitle('');
                            }
                          }}
                          disabled={!newSubtaskTitle.trim()}
                          className="btn-primary text-xs px-2 py-1 rounded-lg disabled:opacity-40 cursor-pointer"
                          aria-label="Adicionar subtarefa"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions: Pin button and More options menu */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onTogglePin && (
              <button
                onClick={() => onTogglePin(task.id)}
                aria-label={task.pinned ? 'Desafixar tarefa' : 'Fixar tarefa no topo'}
                title={task.pinned ? 'Desafixar tarefa' : 'Fixar tarefa no topo'}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  task.pinned
                    ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                    : 'opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${task.pinned ? 'fill-current -rotate-45' : ''}`} />
              </button>
            )}

            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Opções da tarefa"
                aria-expanded={menuOpen}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 btn-ghost p-1.5 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-40 py-1.5 rounded-xl
                    bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                    shadow-xl animate-slide-down"
                  >
                    {onTogglePin && (
                      <button
                        onClick={() => { onTogglePin(task.id); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300
                          hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <Pin className={`w-3.5 h-3.5 ${task.pinned ? 'fill-current -rotate-45' : ''}`} />
                        {task.pinned ? 'Desafixar' : 'Fixar no topo'}
                      </button>
                    )}
                    <button
                      onClick={() => { onEdit(task); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300
                        hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => { onDelete(task); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500
                        hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
