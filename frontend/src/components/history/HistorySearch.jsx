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
  timeSearch,
  onSearchChange,
  onClearSearch,
  deviceFilter,
  onDeviceFilterChange,
  actionFilter = 'all',
  onActionFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full justify-between">
      {/* Ô tìm kiếm theo thời gian với Input primitive */}
      <div className="relative w-full lg:max-w-xs xl:max-w-sm flex items-center">
        <Search className="w-4 h-4 text-blue-600 absolute left-3 pointer-events-none z-10" />
        <Input
          type="text"
          value={timeSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo thời gian (YYYY-MM-DD HH:mm:ss)..."
          className="pl-9 pr-9"
        />
        {timeSearch && (
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

      {/* Nhóm 3 bộ lọc Dropdown: Thiết bị, Hành động, Trạng thái phản hồi */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Lọc theo thiết bị */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[170px]">
          <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <Select value={deviceFilter} onValueChange={onDeviceFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc theo thiết bị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thiết bị</SelectItem>
              <SelectItem value="1">Đèn LED 1 (GPIO 2)</SelectItem>
              <SelectItem value="2">Đèn LED 2 (GPIO 4)</SelectItem>
              <SelectItem value="3">Đèn LED 3 (GPIO 16)</SelectItem>
              <SelectItem value="4">Đèn LED 4 (GPIO 17)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc theo hành động (BẬT / TẮT) */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[150px]">
          <Select value={actionFilter} onValueChange={onActionFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Hành động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hành động</SelectItem>
              <SelectItem value="BẬT">Hành động: BẬT</SelectItem>
              <SelectItem value="TẮT">Hành động: TẮT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lọc theo trạng thái phản hồi (BẬT / TẮT / TIMEOUT) */}
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[160px]">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="BẬT">Trạng thái: BẬT</SelectItem>
              <SelectItem value="TẮT">Trạng thái: TẮT</SelectItem>
              <SelectItem value="TIMEOUT">Trạng thái: TIMEOUT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
