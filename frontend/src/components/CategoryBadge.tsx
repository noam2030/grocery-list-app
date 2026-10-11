import React from 'react';
import { CATEGORY_COLORS } from '../types';

interface Props {
  category: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<Props> = ({ category, size = 'sm' }) => {
  const style = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{category}</span>
    </span>
  );
};
