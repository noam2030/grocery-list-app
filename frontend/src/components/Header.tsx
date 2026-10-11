import React from 'react';
import { ShoppingCart, Moon, Sun, ChevronDown, Plus } from 'lucide-react';
import { GroceryList } from '../types';

interface HeaderProps {
  activeList: GroceryList | null;
  onOpenListSelector: () => void;
  onOpenNewListModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeList,
  onOpenListSelector,
  onOpenNewListModal,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              FreshCart
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Grocery Assistant</p>
          </div>
        </div>

        {/* Center: List Selector Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenListSelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-sm font-medium transition-all"
            aria-label="Switch shopping list"
          >
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {activeList?.name || 'Loading list...'}
            </span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
              {activeList?.itemCount ?? 0}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={onOpenNewListModal}
            title="Create new list"
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 transition-colors"
            aria-label="Create new list"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
