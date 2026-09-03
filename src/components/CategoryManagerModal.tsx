import { useEffect, useRef, useState } from 'react';
import { X, Plus, Trash2, Tags } from 'lucide-react';
import type { Category } from '../types/task';

const COLOR_OPTIONS = [
  { label: 'Azul',     hex: '#3b82f6', bg: 'bg-blue-500' },
  { label: 'Emerald',  hex: '#10b981', bg: 'bg-emerald-500' },
  { label: 'Roxo',     hex: '#8b5cf6', bg: 'bg-purple-500' },
  { label: 'Âmbar',   hex: '#f59e0b', bg: 'bg-amber-500' },
  { label: 'Rosa',     hex: '#ec4899', bg: 'bg-pink-500' },
  { label: 'Ciano',    hex: '#06b6d4', bg: 'bg-cyan-500' },
  { label: 'Laranja',  hex: '#f97316', bg: 'bg-orange-500' },
  { label: 'Vermelho', hex: '#ef4444', bg: 'bg-red-500' },
  { label: 'Slate',    hex: '#64748b', bg: 'bg-slate-500' },
  { label: 'Verde',    hex: '#22c55e', bg: 'bg-green-500' },
];

function generateCategoryId(name: string): string {
  return `cat-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
}

function colorToTailwindClasses(hex: string): Pick<Category, 'bgLight' | 'textLight' | 'bgDark' | 'textDark'> {
  const found = COLOR_OPTIONS.find((c) => c.hex === hex);
  const label = found?.label ?? 'Slate';

  const map: Record<string, Pick<Category, 'bgLight' | 'textLight' | 'bgDark' | 'textDark'>> = {
    Azul:     { bgLight: 'bg-blue-50 text-blue-700 border-blue-200',     textLight: 'text-blue-700',     bgDark: 'dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50',     textDark: 'dark:text-blue-300' },
    Emerald:  { bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200', textLight: 'text-emerald-700', bgDark: 'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50', textDark: 'dark:text-emerald-300' },
    Roxo:     { bgLight: 'bg-purple-50 text-purple-700 border-purple-200', textLight: 'text-purple-700',  bgDark: 'dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50', textDark: 'dark:text-purple-300' },
    Âmbar:   { bgLight: 'bg-amber-50 text-amber-700 border-amber-200',   textLight: 'text-amber-700',   bgDark: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50',   textDark: 'dark:text-amber-300' },
    Rosa:     { bgLight: 'bg-rose-50 text-rose-700 border-rose-200',      textLight: 'text-rose-700',     bgDark: 'dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50',      textDark: 'dark:text-rose-300' },
    Ciano:    { bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',      textLight: 'text-cyan-700',     bgDark: 'dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/50',      textDark: 'dark:text-cyan-300' },
    Laranja:  { bgLight: 'bg-orange-50 text-orange-700 border-orange-200', textLight: 'text-orange-700',  bgDark: 'dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/50', textDark: 'dark:text-orange-300' },
    Vermelho: { bgLight: 'bg-red-50 text-red-700 border-red-200',         textLight: 'text-red-700',      bgDark: 'dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/50',         textDark: 'dark:text-red-300' },
    Slate:    { bgLight: 'bg-slate-100 text-slate-600 border-slate-200',  textLight: 'text-slate-600',    bgDark: 'dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',          textDark: 'dark:text-slate-400' },
    Verde:    { bgLight: 'bg-green-50 text-green-700 border-green-200',   textLight: 'text-green-700',   bgDark: 'dark:bg-green-950/50 dark:text-green-300 dark:border-green-800/50',   textDark: 'dark:text-green-300' },
  };

  return map[label] ?? map['Slate']!;
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryManagerDialog({
  onClose,
  categories,
  onAdd,
  onDelete,
}: Omit<CategoryManagerModalProps, 'isOpen'>) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].hex);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) { setError('Informe o nome da categoria.'); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('Já existe uma categoria com esse nome.');
      return;
    }
    const tailwindClasses = colorToTailwindClasses(newColor);
    onAdd({
      id: generateCategoryId(name),
      name,
      color: newColor,
      ...tailwindClasses,
    });
    setNewName('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
              <Tags className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 id="cat-modal-title" className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
              Categorias
            </h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="btn-ghost p-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Add new */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nova categoria
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Nome da categoria..."
                maxLength={32}
                className="input-base flex-1"
              />
              <button
                onClick={handleAdd}
                aria-label="Adicionar categoria"
                className="btn-primary px-3"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1.5">{error}</p>
            )}

            {/* Color picker */}
            <div className="flex flex-wrap gap-2 mt-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setNewColor(c.hex)}
                  aria-label={c.label}
                  title={c.label}
                  className={`w-6 h-6 rounded-full ${c.bg} transition-all duration-150
                    ${newColor === c.hex
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-700 dark:ring-slate-300 scale-110'
                      : 'opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Existing categories */}
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Categorias existentes ({categories.length})
            </p>
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl
                    bg-slate-50 dark:bg-slate-800/50 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onDelete(cat.id)}
                    aria-label={`Excluir categoria ${cat.name}`}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                      text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40
                      transition-all duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoryManagerModal(props: CategoryManagerModalProps) {
  if (!props.isOpen) return null;
  return (
    <CategoryManagerDialog
      onClose={props.onClose}
      categories={props.categories}
      onAdd={props.onAdd}
      onDelete={props.onDelete}
    />
  );
}
