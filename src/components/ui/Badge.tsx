import React from 'react';
import { ProductivityType, Category } from '../../types/tracker';

interface ProductivityBadgeProps {
  type: ProductivityType;
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export const ProductivityBadge: React.FC<ProductivityBadgeProps> = ({
  type,
  size = 'md',
  onClick,
  className = '',
}) => {
  const styles = {
    Productive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
    Neutral: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
    Distracting: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
  };

  const dots = {
    Productive: 'bg-emerald-400',
    Neutral: 'bg-amber-400',
    Distracting: 'bg-rose-400',
  };

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1.5' 
    : 'text-xs font-medium px-2.5 py-1 gap-2';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full border transition-colors ${styles[type]} ${sizeClasses} ${
        onClick ? 'cursor-pointer select-none' : ''
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[type]}`} />
      <span>{type}</span>
    </span>
  );
};

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  className = '',
}) => {
  const categoryStyles: Record<string, string> = {
    Development: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    Design: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    Communication: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    Entertainment: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    Productivity: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    System: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
  };

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-tight font-medium ${
        categoryStyles[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      } ${sizeClasses} ${className}`}
    >
      {category}
    </span>
  );
};
