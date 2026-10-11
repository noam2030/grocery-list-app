import React, { useState } from 'react';
import { X, Plus, Trash2, Check, ListChecks } from 'lucide-react';
import { GroceryList } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lists: GroceryList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onCreateList: (name: string, description?: string) => Promise<any>;
  onDeleteList: (id: string) => Promise<any>;
  initialCreateMode?: boolean;
}

export const ListSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  initialCreateMode = false
}) => {
  const [isCreating, setIsCreating] = useState(initialCreateMode);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      setSubmitting(true);
      await onCreateList(newListName.trim(), newListDesc.trim());
      setNewListName('');
      setNewListDesc('');
      setIsCreating(false);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (lists.length <= 1) {
      alert('You must have at least one list.');
      return;
    }
    await onDeleteList(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {isCreating ? 'Create Shopping List' : 'Shopping Lists'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  List Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Costco Bulk, Dinner Party, Camping Trip"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Snacks and drinks for Saturday"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 px-3 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newListName.trim()}
                  className="flex-1 py-2 px-3 text-sm font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => {
                const isSelected = list.id === activeListId;
                const isConfirming = confirmDeleteId === list.id;

                return (
                  <div
                    key={list.id}
                    className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelectList(list.id);
                        onClose();
                      }}
                      className="flex-1 text-left flex items-start gap-3"
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {list.name}
                          </span>
                          {list.isDefault && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        {list.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {list.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {list.completedCount ?? 0} of {list.itemCount ?? 0} items completed
                        </p>
                      </div>
                    </button>

                    {/* Delete list button */}
                    {lists.length > 1 && (
                      <div className="ml-2">
                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(list.id)}
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(list.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-80 group-hover:opacity-100 transition-all"
                            title="Delete List"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isCreating && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Shopping List</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
