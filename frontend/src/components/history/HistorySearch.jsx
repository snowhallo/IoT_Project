import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function HistorySearch({
  searchTerm,
  onSearchChange,
  onClearSearch,
  actionFilter,
  onActionFilterChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
      {/* Ô tìm kiếm với Input primitive */}
      <div className="relative w-full sm:max-w-md flex items-center">
        <Search className="w-4 h-4 text-blue-600 absolute left-3 pointer-events-none z-10" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên thiết bị (Đèn LED...) hoặc thời gian..."
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

      {/* Lọc hành động với Select primitive */}
      <div className="flex items-center gap-2 self-start sm:self-auto min-w-[190px]">
        <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <Select value={actionFilter} onValueChange={onActionFilterChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Lọc hành động" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả hành động</SelectItem>
            <SelectItem value="BẬT">Hành động BẬT</SelectItem>
            <SelectItem value="TẮT">Hành động TẮT</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
