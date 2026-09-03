import type { Category, FilterState, SortOption, StatusCounts } from '../types/task';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all',       label: 'Todas' },
  { value: 'pending',   label: 'Pendentes' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'overdue',   label: 'Atrasadas' },
  { value: 'today',     label: 'Hoje' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'all',    label: 'Qualquer' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'high',   label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low',    label: 'Baixa' },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'dueDateAsc',   label: 'Prazo ↑' },
  { value: 'dueDateDesc',  label: 'Prazo ↓' },
  { value: 'priorityDesc', label: 'Prioridade ↓' },
  { value: 'priorityAsc',  label: 'Prioridade ↑' },
  { value: 'createdAtDesc',label: 'Mais recentes' },
  { value: 'titleAsc',     label: 'A-Z' },
];

interface TaskFiltersProps {
  filters: FilterState;
  categories: Category[];
  onSetFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  resultCount: number;
  statusCounts?: StatusCounts;
}

const hasActiveFilters = (f: FilterState) =>
  f.search !== '' || f.status !== 'all' || f.category !== 'all' || f.priority !== 'all';

export function TaskFilters({
  filters,
  categories,
  onSetFilter,
  onReset,
  searchRef,
  resultCount,
  statusCounts,
}: TaskFiltersProps) {
  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="task-search"
          ref={searchRef}
          type="search"
          value={filters.search}
          onChange={(e) => onSetFilter('search', e.target.value)}
          placeholder="Buscar tarefas... (atalho: /)"
          aria-label="Buscar tarefas"
          className="input-base pl-10 pr-10"
        />
        {filters.search && (
          <button
            onClick={() => onSetFilter('search', '')}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => {
            const count = statusCounts ? statusCounts[opt.value] : undefined;
            const isActive = filters.status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onSetFilter('status', opt.value)}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                aria-pressed={isActive}
              >
                <span>{opt.label}</span>
                {count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : opt.value === 'overdue' && count > 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Category select */}
        <div className="relative">
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => onSetFilter('category', e.target.value)}
            aria-label="Filtrar por categoria"
            className="input-base py-1.5 pl-3 pr-8 text-xs cursor-pointer min-w-[130px]"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Priority select */}
        <div className="relative">
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={(e) => onSetFilter('priority', e.target.value)}
            aria-label="Filtrar por prioridade"
            className="input-base py-1.5 pl-3 pr-8 text-xs cursor-pointer min-w-[120px]"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Sort select */}
        <div className="relative flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="filter-sort"
            value={filters.sortBy}
            onChange={(e) => onSetFilter('sortBy', e.target.value as SortOption)}
            aria-label="Ordenar por"
            className="input-base py-1.5 pl-2 pr-8 text-xs cursor-pointer min-w-[120px]"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {active && (
          <button
            onClick={onReset}
            className="btn-ghost text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-2"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}

        {/* Result count */}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'tarefa' : 'tarefas'}
        </span>
      </div>
    </div>
  );
}
