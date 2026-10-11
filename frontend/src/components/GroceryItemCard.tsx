import React from 'react';
import { Check, Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import { GroceryItem } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  item: GroceryItem;
  onToggleComplete: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

export const GroceryItemCard: React.FC<Props> = ({
  item,
  onToggleComplete,
  onUpdateQuantity,
  onDelete
}) => {
  const isDone = item.isCompleted;

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
        isDone
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Left: Checkbox & Item Details */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        {/* Large Accessible Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(item.id)}
          className={`shrink-0 mt-0.5 sm:mt-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isDone
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-900'
          }`}
          aria-label={isDone ? `Mark ${item.name} as incomplete` : `Mark ${item.name} as complete`}
        >
          {isDone && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Text info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-semibold truncate transition-all ${
                isDone
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {item.name}
            </span>

            {/* High priority badge */}
            {item.priority === 'high' && !isDone && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-3 h-3" />
                <span>High</span>
              </span>
            )}
          </div>

          {/* Subtitle: Category & Notes */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <CategoryBadge category={item.category} size="sm" />
            {item.notes && (
              <span className="text-xs text-slate-500 dark:text-slate-400 italic truncate max-w-[200px]">
                "{item.notes}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quantity Stepper & Delete */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Stepper */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-0.5">
          <button
            type="button"
            disabled={item.quantity <= 1 || isDone}
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[36px] text-center">
            {item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
          </span>

          <button
            type="button"
            disabled={isDone}
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-70 group-hover:opacity-100 transition-all"
          title={`Remove ${item.name}`}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
