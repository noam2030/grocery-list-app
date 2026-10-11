import React from 'react';
import { ShoppingBag, SearchX } from 'lucide-react';

interface Props {
  hasFilters: boolean;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<Props> = ({ hasFilters, onResetFilters }) => {
  return (
    <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
      <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        {hasFilters ? <SearchX className="w-7 h-7" /> : <ShoppingBag className="w-7 h-7" />}
      </div>

      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {hasFilters ? 'No matching items found' : 'Your shopping list is empty'}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
        {hasFilters
          ? 'Try checking for typos or clear your search and department filters.'
          : 'Add essentials like produce, milk, or bakery items using the quick entry bar above.'}
      </p>

      {hasFilters && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};
