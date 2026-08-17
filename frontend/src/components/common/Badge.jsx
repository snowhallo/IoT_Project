import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Quản lý biến thể Badge tập trung qua CVA (Class Variance Authority)
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border-rose-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs font-medium',
        lg: 'px-3 py-1.5 text-sm font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export default function Badge({ children, variant, size, className }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
