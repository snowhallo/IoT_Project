import React, { useState } from 'react';
import dayjs from 'dayjs';
import Badge from '../common/Badge';
import { AlertCircle, Lightbulb, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';

/**
 * Bảng Lịch Sử Hoạt Động (History Table)
 * Đầy đủ 5 cột bắt buộc:
 * 1. ID | 2. Tên Thiết Bị | 3. Action (BẬT/TẮT) | 4. Status (BẬT/TẮT) | 5. Thời Gian
 */
export default function HistoryTable({ data, timeSortOrder = 'none', onToggleTimeSort }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyTime = (timeStr, id) => {
    if (!timeStr || timeStr === 'N/A') return;
    navigator.clipboard.writeText(timeStr);
    setCopiedId(id);
    toast.success(`Đã sao chép: ${timeStr}`);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <AlertCircle className="w-9 h-9 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Không tìm thấy lịch sử điều khiển</p>
        <p className="text-xs text-slate-400 mt-1">Vui lòng thử tìm kiếm theo từ khóa khác</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead># ID</TableHead>
          <TableHead>Tên Thiết Bị</TableHead>
          <TableHead>Hành Động (Action)</TableHead>
          <TableHead>Trạng Thái Phản Hồi (Status)</TableHead>
          <TableHead
            onClick={onToggleTimeSort}
            className="cursor-pointer select-none hover:bg-slate-50 transition-colors group"
            title="Sắp xếp theo thời gian thực hiện"
          >
            <div className="inline-flex items-center gap-1.5">
              <span>Thời Gian Thực Hiện</span>
              {timeSortOrder === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
              ) : timeSortOrder === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              )}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => {
          const isActionOn = row.action === 'BẬT' || row.action === 'ON';
          const isStatusOn = row.status === 'BẬT' || row.status === 'ON';
          const formattedTime = row.timestamp ? dayjs(row.timestamp).format('YYYY-MM-DD HH:mm:ss') : 'N/A';

          return (
            <TableRow key={row.id}>
              {/* 1. ID */}
              <TableCell className="font-mono text-slate-500 font-medium">
                #{row.id}
              </TableCell>

              {/* 2. Tên Thiết Bị */}
              <TableCell className="font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <Lightbulb className={`w-4 h-4 ${isStatusOn ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                  <span>{row.deviceName}</span>
                </div>
              </TableCell>

              {/* 3. Action (BẬT / TẮT) */}
              <TableCell>
                <Badge variant={isActionOn ? 'success' : 'default'} size="sm">
                  {row.action}
                </Badge>
              </TableCell>

              {/* 4. Status (BẬT / TẮT / TIMEOUT) */}
              <TableCell>
                <Badge
                  variant={
                    row.status === 'TIMEOUT'
                      ? 'danger'
                      : isStatusOn
                      ? 'success'
                      : 'default'
                  }
                  size="sm"
                >
                  {row.status}
                </Badge>
              </TableCell>

              {/* 5. Thời Gian */}
              <TableCell className="font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <span>{formattedTime}</span>
                  {formattedTime !== 'N/A' && (
                    <button
                      type="button"
                      onClick={() => handleCopyTime(formattedTime, row.id)}
                      title="Sao chép mốc thời gian"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      {copiedId === row.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
