import React from 'react';

export default function Header({ title, subtitle, className }) {
  return (
    <header className={`flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 ${className || ''}`}>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </header>
  );
}
