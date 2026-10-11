import React, { useState } from 'react';
import { Plus, Minus, FileText, ChevronDown } from 'lucide-react';
import { CATEGORIES, PriorityLevel } from '../types';
import { suggestCategory } from '../hooks/useGroceryList';

interface Props {
  onAddItem: (item: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    priority: PriorityLevel;
    notes?: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const COMMON_UNITS = ['pcs', 'pack', 'kg', 'lbs', 'oz', 'loaf', 'gallon', 'bunch', 'box', 'can', 'bottle'];

export const AddItemForm: React.FC<Props> = ({ onAddItem, disabled }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState<string>('Other');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-suggest category on name change if user hasn't manually customized or defaults to Other
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const suggested = suggestCategory(val);
    if (suggested !== 'Other') {
      setCategory(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddItem({
        name: name.trim(),
        quantity: Math.max(1, quantity),
        unit,
        category,
        priority,
        notes: notes.trim()
      });

      // Reset form
      setName('');
      setQuantity(1);
      setNotes('');
      setShowNotes(false);
      setCategory('Other');
      setPriority('medium');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3 transition-colors"
    >
      {/* Row 1: Item Name & Add Button */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add an item... (e.g. Bananas, Milk, Sourdough)"
          value={name}
          onChange={handleNameChange}
          disabled={disabled}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />

        <button
          type="submit"
          disabled={disabled || !name.trim() || isSubmitting}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add</span>
        </button>
      </div>

      {/* Row 2: Quantity Stepper, Unit Selector, Category & Priority */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Quantity Stepper */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-slate-800 dark:text-slate-200 min-w-[24px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Unit Selector */}
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          {COMMON_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        {/* Category Selector */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pl-2.5 pr-6 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Priority Selector */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5">
          {(['low', 'medium', 'high'] as PriorityLevel[]).map((p) => {
            const isSelected = priority === p;
            const colors = {
              low: 'text-slate-500',
              medium: 'text-amber-500',
              high: 'text-rose-500'
            };
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-2 py-1 rounded text-[11px] capitalize font-semibold transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <span className={isSelected ? colors[p] : ''}>{p}</span>
              </button>
            );
          })}
        </div>

        {/* Toggle Note */}
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
            showNotes || notes
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          title="Add note / brand instructions"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium hidden sm:inline">Note</span>
        </button>
      </div>

      {/* Row 3: Optional Expandable Note Input */}
      {showNotes && (
        <div className="pt-1">
          <input
            type="text"
            placeholder="Add brand, aisle notes, or ripeness preference..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      )}
    </form>
  );
};
