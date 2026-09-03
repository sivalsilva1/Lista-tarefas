import { useRef, useState } from 'react';
import type { Task } from './types/task';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { QuickAddTask } from './components/QuickAddTask';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskCalendar } from './components/TaskCalendar';
import { TaskModal } from './components/TaskModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/ToastContainer';
import { CheckSquare, Loader2, ListTodo, Calendar as CalendarIcon } from 'lucide-react';

export default function App() {
  const { user, profile, loading, signIn, signUp, signOut, resetPassword } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  const {
    tasks,
    filteredTasks,
    categories,
    filters,
    stats,
    statusCounts,
    isSyncing,
    syncError,
    createTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleComplete,
    togglePin,
    toggleSubtask,
    addSubtaskToTask,
    deleteAllCompleted,
    bulkRestoreTasks,
    addCategory,
    deleteCategory,
    setFilter,
    resetFilters,
    exportData,
    importData,
    resetToDemo,
  } = useTasks(user?.id);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showDashboard, setShowDashboard] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<string | undefined>(undefined);
  const [catsModalOpen, setCatsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const openNewTask = () => {
    setEditingTask(null);
    setInitialDateForNewTask(undefined);
    setTaskModalOpen(true);
  };

  const openNewTaskForDate = (dateStr: string) => {
    setEditingTask(null);
    setInitialDateForNewTask(dateStr);
    setTaskModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setInitialDateForNewTask(undefined);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTask(null);
    setInitialDateForNewTask(undefined);
  };

  const handleSaveTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      addToast({ type: 'success', message: 'Tarefa atualizada!', description: data.title });
    } else {
      createTask(data);
      addToast({ type: 'success', message: 'Tarefa criada!', description: data.title });
    }
    closeTaskModal();
  };

  const handleDeleteRequest = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const deletedTask = deleteTarget;
    deleteTask(deletedTask.id);
    setDeleteTarget(null);
    addToast({
      type: 'info',
      message: 'Tarefa excluída',
      description: deletedTask.title,
      undoAction: () => {
        restoreTask(deletedTask);
        addToast({ type: 'success', message: 'Tarefa restaurada!', description: deletedTask.title });
      },
    });
  };

  const handleToggle = (id: string) => {
    toggleComplete(id);
  };

  const handleDeleteAllCompleted = () => {
    const removed = deleteAllCompleted();
    if (removed.length === 0) return;
    addToast({
      type: 'info',
      message: `${removed.length} tarefa${removed.length > 1 ? 's' : ''} removida${removed.length > 1 ? 's' : ''}`,
      description: 'Todas as tarefas concluídas foram removidas.',
      undoAction: () => {
        bulkRestoreTasks(removed);
        addToast({ type: 'success', message: 'Tarefas restauradas!' });
      },
    });
  };

  const handleImport = (json: string): boolean => {
    const ok = importData(json);
    if (ok) {
      addToast({ type: 'success', message: 'Dados importados com sucesso!' });
    } else {
      addToast({ type: 'error', message: 'Falha ao importar', description: 'Arquivo inválido ou corrompido.' });
    }
    return ok;
  };

  const handleResetDemo = () => {
    resetToDemo();
    addToast({ type: 'info', message: 'Dados de demonstração restaurados!' });
  };

  const handleSignOut = async () => {
    await signOut();
    addToast({ type: 'info', message: 'Você saiu da sua conta.' });
  };

  useKeyboardShortcuts({
    onNewTask: openNewTask,
    onFocusSearch: () => searchRef.current?.focus(),
    onToggleDashboard: () => setShowDashboard((v) => !v),
    onToggleCalendar: () => setViewMode((v) => (v === 'list' ? 'calendar' : 'list')),
    onEscape: () => {
      if (taskModalOpen) closeTaskModal();
      if (catsModalOpen) setCatsModalOpen(false);
      if (deleteTarget) setDeleteTarget(null);
    },
  });

  // ── Tela de Carregamento Inicial ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 animate-pulse">
          <CheckSquare className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Carregando TaskFlow…</span>
        </div>
      </div>
    );
  }

  // ── Se não estiver autenticado, exibe a tela de login/cadastro/recuperação ─
  if (!user) {
    return (
      <>
        <AuthPage
          onSignIn={signIn}
          onSignUp={signUp}
          onResetPassword={resetPassword}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  const isFiltered =
    filters.search !== '' || filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header
        stats={stats}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNewTask={openNewTask}
        onOpenCategories={() => setCatsModalOpen(true)}
        onToggleDashboard={() => setShowDashboard((v) => !v)}
        showDashboard={showDashboard}
        onExport={exportData}
        onImport={handleImport}
        onResetDemo={handleResetDemo}
        onDeleteAllCompleted={handleDeleteAllCompleted}
        isSyncing={isSyncing}
        syncError={syncError}
        userEmail={user.email}
        displayName={profile?.display_name || user.user_metadata?.display_name}
        onSignOut={handleSignOut}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === 'list' ? 'calendar' : 'list'))}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Dashboard */}
        {showDashboard && <AnalyticsDashboard stats={stats} />}

        {/* Quick Add (sempre visível para agilidade) */}
        <section aria-label="Criação rápida de tarefas">
          <QuickAddTask
            categories={categories}
            onCreateTask={(data) => {
              createTask(data);
              addToast({ type: 'success', message: 'Tarefa criada!', description: data.title });
            }}
            onOpenFullModal={openNewTask}
          />
        </section>

        {/* Seletor de visualização (Lista vs Calendário) */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Lista</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendário</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Pressione <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-mono text-[10px]">C</kbd> para alternar
          </div>
        </div>

        {/* Conteúdo Dinâmico: Lista ou Calendário */}
        {viewMode === 'list' ? (
          <>
            {/* Filters */}
            <section aria-label="Filtros de tarefas">
              <TaskFilters
                filters={filters}
                categories={categories}
                onSetFilter={setFilter}
                onReset={resetFilters}
                searchRef={searchRef as React.RefObject<HTMLInputElement>}
                resultCount={filteredTasks.length}
                statusCounts={statusCounts}
              />
            </section>

            {/* Task list */}
            <section aria-label="Lista de tarefas">
              <TaskList
                tasks={filteredTasks}
                categories={categories}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={handleDeleteRequest}
                onToggleSubtask={toggleSubtask}
                onTogglePin={togglePin}
                onAddSubtask={addSubtaskToTask}
                onNewTask={openNewTask}
                isFiltered={isFiltered}
              />
            </section>
          </>
        ) : (
          /* Task Calendar */
          <section aria-label="Calendário de tarefas">
            <TaskCalendar
              tasks={tasks}
              categories={categories}
              onToggleTask={handleToggle}
              onEditTask={openEdit}
              onDeleteTask={handleDeleteRequest}
              onNewTaskForDate={openNewTaskForDate}
            />
          </section>
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        editingTask={editingTask}
        categories={categories}
        initialDate={initialDateForNewTask}
      />

      <CategoryManagerModal
        isOpen={catsModalOpen}
        onClose={() => setCatsModalOpen(false)}
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={deleteTarget?.title ?? ''}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
