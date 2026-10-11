import React from 'react';
import { Search, X, LayoutGrid, List, ArrowDownAZ } from 'lucide-react';
import { StatusFilter, SortOption, CATEGORIES, GroceryItem } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  isAisleView: boolean;
  onToggleAisleView: () => void;
  items: GroceryItem[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortOption,
  onSortChange,
  isAisleView,
  onToggleAisleView,
  items
}) => {
  // Compute counts per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [items]);

  const activeCount = items.filter((i) => !i.isCompleted).length;
  const doneCount = items.filter((i) => i.isCompleted).length;

  return (
    <div className="space-y-3">
      {/* Row 1: Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle & Sort dropdown */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={onToggleAisleView}
            className={`p-2 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors ${
              isAisleView
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title={isAisleView ? 'Switch to Flat List' : 'Switch to Grouped Aisle View'}
          >
            {isAisleView ? (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Aisle</span>
              </>
            ) : (
              <>
                <List className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Flat</span>
              </>
            )}
          </button>

          {/* Sort selector */}
          <div className="relative flex items-center">
            <ArrowDownAZ className="w-4 h-4 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="pl-8 pr-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none shadow-sm cursor-pointer"
            >
              <option value="aisle">Sort: Aisle</option>
              <option value="name">Sort: A-Z</option>
              <option value="priority">Sort: Priority</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 2: Status Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => onStatusChange('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => onStatusChange('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Completed ({doneCount})
          </button>
        </div>
      </div>

      {/* Row 3: Horizontal Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange('all')}
          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            categoryFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          All Departments
        </button>

        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = categoryFilter.toLowerCase() === cat.toLowerCase();

          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(isSelected ? 'all' : cat)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
