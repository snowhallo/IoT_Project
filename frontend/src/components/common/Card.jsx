import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white border-slate-200',
        elevated: 'bg-white border-slate-200 shadow-md',
        interactive: 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export default function Card({ children, className, variant, title, subtitle, action }) {
  return (
    <div className={cn(cardVariants({ variant }), className)}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
