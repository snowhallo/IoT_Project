import React from 'react';
import dayjs from 'dayjs';
import { Thermometer, Droplets, Sun, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';

export default function SensorTable({ data }) {
  const getSensorMeta = (type) => {
    switch (type) {
      case 'temperature':
        return {
          icon: Thermometer,
          iconColor: 'text-orange-600',
          variant: 'orange',
        };
      case 'humidity':
        return {
          icon: Droplets,
          iconColor: 'text-cyan-600',
          variant: 'cyan',
        };
      case 'light':
      default:
        return {
          icon: Sun,
          iconColor: 'text-amber-600',
          variant: 'warning',
        };
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <AlertCircle className="w-9 h-9 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Không tìm thấy dữ liệu cảm biến</p>
        <p className="text-xs text-slate-400 mt-1">Vui lòng thử lại với bộ lọc hoặc mốc thời gian khác</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead># ID</TableHead>
          <TableHead>Loại Cảm Biến</TableHead>
          <TableHead>Giá Trị Đo</TableHead>
          <TableHead>Đơn Vị</TableHead>
          <TableHead>Thời Gian Ghi Nhận</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => {
          const meta = getSensorMeta(row.type);
          const Icon = meta.icon;
          const formattedTime = row.timestamp ? dayjs(row.timestamp).format('YYYY-MM-DD HH:mm:ss') : 'N/A';

          return (
            <TableRow key={row.id}>
              {/* 1. ID */}
              <TableCell className="font-mono text-slate-500 font-medium">
                #{row.id}
              </TableCell>

              {/* 2. Loại Cảm Biến */}
              <TableCell className="font-medium text-slate-800">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  <span>{row.sensorName}</span>
                </div>
              </TableCell>

              {/* 3. Giá Trị Đo */}
              <TableCell className="font-mono font-bold text-slate-900">
                {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
              </TableCell>

              {/* 4. Đơn Vị */}
              <TableCell>
                <Badge variant={meta.variant} size="sm">
                  {row.unit}
                </Badge>
              </TableCell>

              {/* 5. Thời Gian Ghi Nhận */}
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
