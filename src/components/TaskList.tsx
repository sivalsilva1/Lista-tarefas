import { ClipboardList, Plus, Sparkles } from 'lucide-react';
import type { Category, Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onNewTask: () => void;
  isFiltered: boolean;
  onTogglePin?: (id: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
}

export function TaskList({
  tasks,
  categories,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onNewTask,
  isFiltered,
  onTogglePin,
  onAddSubtask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        {isFiltered ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Tente ajustar os filtros ou a busca para ver outros resultados.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-5">
              <ClipboardList className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-200">
              Nenhuma tarefa ainda
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
              Crie sua primeira tarefa para começar a organizar o seu dia com produtividade.
            </p>
            <button onClick={onNewTask} className="btn-primary mt-6">
              <Plus className="w-4 h-4" />
              Criar primeira tarefa
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          categories={categories}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleSubtask={onToggleSubtask}
          onTogglePin={onTogglePin}
          onAddSubtask={onAddSubtask}
        />
      ))}
    </div>
  );
}
