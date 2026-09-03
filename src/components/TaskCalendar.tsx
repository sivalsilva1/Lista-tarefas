import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Pin,
  ListTodo,
} from 'lucide-react';
import type { Category, Task } from '../types/task';
import {
  MONTH_NAMES,
  WEEKDAYS,
  formatDayFullPtBr,
  getMonthDays,
} from '../utils/calendarUtils';
import { getTodayDateString } from '../utils/dateUtils';

interface TaskCalendarProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onNewTaskForDate: (dateStr: string) => void;
}

export function TaskCalendar({
  tasks,
  categories,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onNewTaskForDate,
}: TaskCalendarProps) {
  const todayStr = getTodayDateString();
  const [todayY, todayM] = todayStr.split('-').map(Number);

  // Mês e ano atualmente visualizados
  const [currentYear, setCurrentYear] = useState(todayY);
  const [currentMonth, setCurrentMonth] = useState(todayM - 1); // 0-indexed

  // Dia selecionado para exibir detalhes
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Mapear categorias para lookup rápido
  const categoryMap = useMemo(() => {
    return new Map<string, Category>(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Agrupar tarefas por data (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const dateKey = task.dueDate.slice(0, 10);
      const list = map.get(dateKey) || [];
      list.push(task);
      map.set(dateKey, list);
    }
    return map;
  }, [tasks]);

  // Dias da grade do mês
  const calendarDays = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Tarefas do dia atualmente selecionado
  const selectedDayTasks = useMemo(() => {
    return tasksByDate.get(selectedDateStr) || [];
  }, [tasksByDate, selectedDateStr]);

  // Navegar para o mês anterior
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Navegar para o próximo mês
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Voltar para hoje
  const handleGoToday = () => {
    const [y, m] = todayStr.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
    setSelectedDateStr(todayStr);
  };

  // Total de tarefas no mês atual
  const currentMonthTaskCount = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(monthPrefix)).length;
  }, [tasks, currentYear, currentMonth]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Barra de Controles do Calendário */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
              {MONTH_NAMES[currentMonth]} de {currentYear}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentMonthTaskCount} {currentMonthTaskCount === 1 ? 'tarefa com prazo' : 'tarefas com prazo'} neste mês
            </p>
          </div>
        </div>

        {/* Botões de Navegação */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Hoje
          </button>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wider ${
                idx === 0 || idx === 6
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Células dos dias */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80 border-b border-slate-100 dark:border-slate-800">
          {calendarDays.map((day) => {
            const dayTasks = tasksByDate.get(day.dateStr) || [];
            const isSelected = day.dateStr === selectedDateStr;
            const completedCount = dayTasks.filter((t) => t.completed).length;

            return (
              <div
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors cursor-pointer group relative ${
                  !day.isCurrentMonth
                    ? 'bg-slate-50/60 dark:bg-slate-950/30 text-slate-400 dark:text-slate-600'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset z-10' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'}`}
              >
                {/* Cabeçalho do dia */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full transition-transform ${
                      day.isToday
                        ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/40 scale-105'
                        : isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : ''
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Botão de adicionar rápido ao passar o mouse */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewTaskForDate(day.dateStr);
                    }}
                    title={`Adicionar tarefa em ${day.dateStr}`}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Lista de pílulas de tarefas do dia (até 3) */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => {
                    const cat = categoryMap.get(task.category);
                    const catColor = cat?.color || '#6366f1';

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        style={{
                          backgroundColor: `${catColor}15`,
                          borderLeftColor: catColor,
                        }}
                        className={`text-[11px] leading-tight px-1.5 py-1 rounded border-l-2 truncate flex items-center gap-1 transition-opacity hover:opacity-90 ${
                          task.completed
                            ? 'opacity-50 line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                        title={`${task.title} (${cat?.name || 'Sem categoria'})`}
                      >
                        {task.pinned && <Pin className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />}
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}

                  {/* Se tiver mais de 3 tarefas */}
                  {dayTasks.length > 3 && (
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1">
                      +{dayTasks.length - 3} mais
                    </p>
                  )}
                </div>

                {/* Rodapé do dia com contadores rápidos */}
                {dayTasks.length > 0 && (
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>
                      {completedCount}/{dayTasks.length}
                    </span>
                    {dayTasks.some((t) => t.priority === 'urgent' && !t.completed) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Contém tarefa urgente" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel de Detalhes do Dia Selecionado */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Tarefas do Dia
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {formatDayFullPtBr(selectedDateStr)}
            </h3>
          </div>

          <button
            onClick={() => onNewTaskForDate(selectedDateStr)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar tarefa para este dia</span>
          </button>
        </div>

        {/* Lista de tarefas daquele dia */}
        {selectedDayTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <ListTodo className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
            <p className="text-sm font-medium">Nenhuma tarefa agendada para esta data.</p>
            <p className="text-xs text-slate-400">
              Clique no botão acima para adicionar uma nova tarefa para este dia.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDayTasks.map((task) => {
              const cat = categoryMap.get(task.category);
              const catColor = cat?.color || '#6366f1';

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox de Conclusão */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.pinned && (
                          <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span>{cat?.name || 'Sem categoria'}</span>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length} subtarefas
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onEditTask(task)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteTask(task)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
