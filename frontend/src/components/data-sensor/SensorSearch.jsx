import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Input } from '../ui/input';

export default function SensorSearch({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onSearch,
  onReset,
  hasFilter = false,
  filterType = 'all',
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) onSearch();
    }
  };

  const getPlaceholder = () => {
    switch (filterType) {
      case 'temperature':
        return 'Nhập giá trị nhiệt độ (VD: 28.5)...';
      case 'humidity':
        return 'Nhập giá trị độ ẩm (VD: 65)...';
      case 'light':
        return 'Nhập giá trị ánh sáng (VD: 500)...';
      case 'gas':
        return 'Nhập giá trị khí gas (VD: 450)...';
      case 'time':
        return 'Nhập thời gian (VD: 2026-08-15 hoặc 14:30)...';
      default:
        return 'Nhập giá trị đo hoặc mốc thời gian...';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1 max-w-xl">
      <div className="relative flex-1 min-w-[240px] flex items-center">
        <Search className="w-4 h-4 text-blue-600 absolute left-3 pointer-events-none z-10" />

        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="pl-9 pr-9"
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

      {/* Nút Tìm kiếm */}
      <button
        type="button"
        onClick={onSearch}
        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
        title="Nhấn để tìm kiếm hoặc lọc"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Tìm kiếm</span>
      </button>

      {/* Nút Đặt lại (khi có bộ lọc hoặc tìm kiếm) */}
      {hasFilter && (
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          title="Đặt lại về mặc định"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  );
}
