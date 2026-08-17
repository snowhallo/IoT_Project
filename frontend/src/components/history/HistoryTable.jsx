import React from 'react';
import dayjs from 'dayjs';
import Badge from '../common/Badge';
import { AlertCircle, Lightbulb } from 'lucide-react';
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
export default function HistoryTable({ data }) {
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
          <TableHead>Thời Gian Thực Hiện</TableHead>
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

              {/* 4. Status (BẬT / TẮT) */}
              <TableCell>
                <Badge variant={isStatusOn ? 'success' : 'default'} size="sm">
                  {row.status}
                </Badge>
              </TableCell>

              {/* 5. Thời Gian */}
              <TableCell className="font-mono text-slate-600">
                {formattedTime}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
