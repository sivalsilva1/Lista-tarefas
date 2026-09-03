import type { TaskStats } from '../types/task';
import { CheckCircle2, Clock, AlertCircle, CalendarClock, TrendingUp, BarChart3 } from 'lucide-react';

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgente',
  high:   'Alta',
  medium: 'Média',
  low:    'Baixa',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-400',
};

interface AnalyticsDashboardProps {
  stats: TaskStats;
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  const maxCategoryCount = Math.max(...stats.categoryDistribution.map((c) => c.count), 1);
  const maxPriorityCount = Math.max(...stats.priorityDistribution.map((p) => p.count), 1);

  return (
    <section aria-label="Painel de análises" className="space-y-5 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          label="Concluídas"
          value={stats.completed}
          bg="bg-emerald-50 dark:bg-emerald-950/40"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-indigo-500" />}
          label="Pendentes"
          value={stats.pending}
          bg="bg-indigo-50 dark:bg-indigo-950/40"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          label="Atrasadas"
          value={stats.overdue}
          bg="bg-red-50 dark:bg-red-950/40"
          highlight={stats.overdue > 0}
        />
        <StatCard
          icon={<CalendarClock className="w-5 h-5 text-amber-500" />}
          label="Vencem hoje"
          value={stats.dueToday}
          bg="bg-amber-50 dark:bg-amber-950/40"
          highlight={stats.dueToday > 0}
        />
      </div>

      {/* Productivity rate + charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completion ring */}
        <div className="card p-5 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Produtividade</h3>
          </div>
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke={stats.completionRate >= 80 ? '#10b981' : stats.completionRate >= 50 ? '#6366f1' : '#f59e0b'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40 * (stats.completionRate / 100)} ${2 * Math.PI * 40}`}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-black text-slate-900 dark:text-slate-100">
                {stats.completionRate}%
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {stats.completed} de {stats.total} {stats.total === 1 ? 'tarefa' : 'tarefas'} concluídas
          </p>
        </div>

        {/* Category distribution */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Por categoria</h3>
          </div>
          {stats.categoryDistribution.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">Nenhum dado</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.categoryDistribution.map((item) => (
                <li key={item.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{item.category}</span>
                    <span className="text-slate-500 dark:text-slate-500 flex-shrink-0 ml-2">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(item.count / maxCategoryCount) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Priority distribution */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Por prioridade</h3>
          </div>
          <ul className="space-y-2.5">
            {stats.priorityDistribution.map((item) => (
              <li key={item.priority}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{PRIORITY_LABELS[item.priority]}</span>
                  <span className="text-slate-500 dark:text-slate-500">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${PRIORITY_COLORS[item.priority]} transition-all duration-700`}
                    style={{ width: `${(item.count / maxPriorityCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, bg, highlight }: StatCardProps) {
  return (
    <div className={`card p-4 flex items-center gap-3 ${highlight && value > 0 ? 'animate-pulse-soft' : ''}`}>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">
          {value}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}
