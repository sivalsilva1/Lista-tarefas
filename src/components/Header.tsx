import { useState } from 'react';
import {
  Plus, Moon, Sun, Tags, BarChart3, Keyboard, CheckCircle2,
  Download, Upload, Trash2, RefreshCw, ClipboardList, X,
  Cloud, CloudOff, Loader2, LogOut, Calendar as CalendarIcon
} from 'lucide-react';
import type { TaskStats } from '../types/task';

interface HeaderProps {
  stats: TaskStats;
  isDark: boolean;
  onToggleTheme: () => void;
  onNewTask: () => void;
  onOpenCategories: () => void;
  onToggleDashboard: () => void;
  showDashboard: boolean;
  onExport: () => void;
  onImport: (json: string) => boolean;
  onResetDemo: () => void;
  onDeleteAllCompleted: () => void;
  isSyncing?: boolean;
  syncError?: string | null;
  userEmail?: string;
  displayName?: string;
  onSignOut?: () => void;
  viewMode?: 'list' | 'calendar';
  onToggleViewMode?: () => void;
}

export function Header({
  stats,
  isDark,
  onToggleTheme,
  onNewTask,
  onOpenCategories,
  onToggleDashboard,
  showDashboard,
  onExport,
  onImport,
  onResetDemo,
  onDeleteAllCompleted,
  isSyncing = false,
  syncError = null,
  userEmail,
  displayName,
  onSignOut,
  viewMode = 'list',
  onToggleViewMode,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        onImport(text);
      };
      reader.readAsText(file);
    };
    input.click();
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md
      border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
              TaskFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              {stats.completed}/{stats.total} concluídas
            </p>
          </div>
        </div>

        {/* Quick stats (md+) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2">
          <StatsChip
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            label={`${stats.completionRate}% produtividade`}
          />
          {stats.overdue > 0 && (
            <StatsChip
              icon={<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />}
              label={`${stats.overdue} atrasada${stats.overdue > 1 ? 's' : ''}`}
              danger
            />
          )}
          {stats.dueToday > 0 && (
            <StatsChip
              icon={<span className="w-2 h-2 rounded-full bg-amber-500" />}
              label={`${stats.dueToday} hoje`}
            />
          )}
          {/* Indicador de sincronização Supabase */}
          <div
            title={syncError ?? (isSyncing ? 'Sincronizando com Supabase…' : 'Sincronizado com Supabase')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg"
          >
            {syncError ? (
              <CloudOff className="w-3.5 h-3.5 text-red-500" />
            ) : isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className={`text-xs ${
              syncError ? 'text-red-500' : isSyncing ? 'text-indigo-500' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {syncError ? 'Offline' : isSyncing ? 'Sync…' : 'Salvo'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Calendar view toggle */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              aria-label={viewMode === 'calendar' ? 'Ver em Lista' : 'Ver em Calendário'}
              title={viewMode === 'calendar' ? 'Ver Lista (C)' : 'Ver Calendário (C)'}
              className={`btn-ghost px-3 py-2 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : ''
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          )}

          {/* Dashboard toggle */}
          <button
            onClick={onToggleDashboard}
            aria-label={showDashboard ? 'Ocultar análises' : 'Ver análises'}
            title="Dashboard (D)"
            className={`btn-ghost px-3 py-2 ${showDashboard ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Categories */}
          <button
            onClick={onOpenCategories}
            aria-label="Gerenciar categorias"
            title="Categorias"
            className="btn-ghost px-3 py-2"
          >
            <Tags className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="btn-ghost px-3 py-2 transition-transform duration-200 active:scale-90 cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-fade-in transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 animate-fade-in transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Mais opções"
              aria-expanded={menuOpen}
              className="btn-ghost px-3 py-2"
            >
              <span className="flex flex-col gap-0.5">
                <span className="w-4 h-0.5 bg-current rounded" />
                <span className="w-3 h-0.5 bg-current rounded" />
                <span className="w-4 h-0.5 bg-current rounded" />
              </span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-60 py-2 rounded-2xl
                  bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                  shadow-xl animate-slide-down divide-y divide-slate-100 dark:divide-slate-800"
                >
                  {/* Seção do Usuário */}
                  {userEmail && (
                    <div className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-xs flex-shrink-0">
                          {(displayName || userEmail).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {displayName || 'Usuário'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <MenuSection label="Atalhos de teclado">
                      <MenuItem
                        icon={<Keyboard className="w-3.5 h-3.5" />}
                        label="Ver atalhos"
                        onClick={() => { setShortcutsOpen(true); setMenuOpen(false); }}
                      />
                    </MenuSection>
                    <MenuSection label="Dados">
                      <MenuItem icon={<Download className="w-3.5 h-3.5" />} label="Exportar JSON" onClick={() => { onExport(); setMenuOpen(false); }} />
                      <MenuItem icon={<Upload className="w-3.5 h-3.5" />} label="Importar JSON" onClick={handleImportClick} />
                      <MenuItem icon={<RefreshCw className="w-3.5 h-3.5" />} label="Restaurar demo" onClick={() => { onResetDemo(); setMenuOpen(false); }} />
                    </MenuSection>
                    {stats.completed > 0 && (
                      <MenuSection label="Manutenção">
                        <MenuItem
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          label={`Limpar concluídas (${stats.completed})`}
                          onClick={() => { onDeleteAllCompleted(); setMenuOpen(false); }}
                          danger
                        />
                      </MenuSection>
                    )}
                  </div>

                  {onSignOut && (
                    <div className="pt-1">
                      <MenuItem
                        icon={<LogOut className="w-3.5 h-3.5" />}
                        label="Sair da conta"
                        onClick={() => { onSignOut(); setMenuOpen(false); }}
                        danger
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* New task */}
          <button
            id="new-task-btn"
            onClick={onNewTask}
            aria-label="Nova tarefa (N)"
            title="Nova tarefa (N)"
            className="btn-primary cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova tarefa</span>
          </button>
        </div>
      </div>

      {/* Subtle completion progress bar */}
      <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${stats.completionRate}%` }}
        />
      </div>

      {/* Keyboard shortcuts modal */}
      {shortcutsOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setShortcutsOpen(false); }}
        >
          <div className="modal-panel max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                Atalhos de teclado
              </h2>
              <button onClick={() => setShortcutsOpen(false)} aria-label="Fechar" className="btn-ghost p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-3">
              {[
                { keys: ['N'], desc: 'Nova tarefa' },
                { keys: ['C'], desc: 'Alternar Calendário / Lista' },
                { keys: ['/'], desc: 'Focar na busca' },
                { keys: ['D'], desc: 'Abrir / fechar análises' },
                { keys: ['Esc'], desc: 'Fechar modal' },
              ].map(({ keys, desc }) => (
                <li key={desc} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{desc}</span>
                  <div className="flex gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800
                          text-xs font-mono text-slate-700 dark:text-slate-300
                          border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

function StatsChip({ icon, label, danger = false }: { icon: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg
      ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}
    >
      {icon}
      {label}
    </div>
  );
}

function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left
        ${danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
