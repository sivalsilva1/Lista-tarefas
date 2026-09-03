import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, taskTitle }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="delete-modal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Excluir tarefa?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tem certeza que deseja excluir{' '}
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                &ldquo;{taskTitle}&rdquo;
              </strong>
              ? Você poderá desfazer essa ação logo após a exclusão.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cancelar"
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-danger">
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  );
}
