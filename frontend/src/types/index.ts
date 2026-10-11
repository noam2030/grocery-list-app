export const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Bakery',
  'Meat & Seafood',
  'Pantry',
  'Frozen',
  'Beverages',
  'Household',
  'Snacks',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Produce': { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'Dairy & Eggs': { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  'Bakery': { bg: 'bg-orange-50 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  'Meat & Seafood': { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  'Pantry': { bg: 'bg-stone-50 dark:bg-stone-900', text: 'text-stone-700 dark:text-stone-300', border: 'border-stone-200 dark:border-stone-700', dot: 'bg-stone-500' },
  'Frozen': { bg: 'bg-sky-50 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
  'Beverages': { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  'Household': { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  'Snacks': { bg: 'bg-pink-50 dark:bg-pink-950/60', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800', dot: 'bg-pink-500' },
  'Other': { bg: 'bg-slate-50 dark:bg-slate-800/60', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' }
};

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface GroceryList {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  itemCount?: number;
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: PriorityLevel;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = 'all' | 'active' | 'completed';
export type SortOption = 'aisle' | 'name' | 'priority' | 'newest';
