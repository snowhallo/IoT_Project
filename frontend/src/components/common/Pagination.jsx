import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui/button';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          Hiển thị <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
          <span className="font-semibold text-slate-700">{endItem}</span> trên tổng số{' '}
          <span className="font-semibold text-blue-600">{totalItems}</span> bản ghi
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                if (onPageChange) onPageChange(1);
              }}
              className="h-7 px-2 border border-slate-300 rounded bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} dòng / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {getPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? 'default' : 'outline'}
            size="sm"
            className="min-w-[28px] h-7 px-2"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Trang sau"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Trang cuối"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
