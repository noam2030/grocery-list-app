import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

interface Props {
  total: number;
  completed: number;
  percent: number;
  onClearCompleted: () => void;
}

export const BatchActionsBar: React.FC<Props> = ({
  total,
  completed,
  percent,
  onClearCompleted
}) => {
  if (total === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 max-w-4xl mx-auto px-4 mt-6">
      <div className="bg-slate-900/90 dark:bg-slate-800/90 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
        {/* Progress Info */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {completed} of {total} completed ({percent}%)
              </span>
            </span>
            <span className="text-slate-400">
              {total - completed} left to buy
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Clear Completed Button */}
        {completed > 0 && (
          <button
            onClick={onClearCompleted}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed ({completed})</span>
          </button>
        )}
      </div>
    </div>
  );
};
