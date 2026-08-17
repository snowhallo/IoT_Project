import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';

export default function SensorSearch({ searchTerm, onSearchChange, onClearSearch }) {
  return (
    <div className="w-full sm:w-auto flex-1 max-w-md">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-blue-600 absolute left-3 pointer-events-none z-10" />

        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nhập thời gian (VD: 2026-08-15 14:30 hoặc 2026-08-15)"
          className="pl-9 pr-9 font-mono"
        />

        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 text-slate-400 hover:text-slate-600 z-10"
            title="Xóa tìm kiếm"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
