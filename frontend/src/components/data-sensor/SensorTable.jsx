import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Thermometer, Droplets, Sun, Wind, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Badge from '../common/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';

export default function SensorTable({ data, sortConfig = { field: null, order: 'none' }, onSort }) {
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

  const SENSOR_META = {
    temperature: { icon: Thermometer, iconColor: 'text-orange-600', variant: 'orange' },
    humidity: { icon: Droplets, iconColor: 'text-cyan-600', variant: 'cyan' },
    gas: { icon: Wind, iconColor: 'text-purple-600', variant: 'purple' },
    light: { icon: Sun, iconColor: 'text-amber-600', variant: 'warning' },
  };

  const getSensorMeta = (type) => SENSOR_META[type] || SENSOR_META.light;

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <AlertCircle className="w-9 h-9 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-700">Không tìm thấy dữ liệu cảm biến</p>
        <p className="text-xs text-slate-400 mt-1">Vui lòng thử lại với bộ lọc hoặc mốc thời gian khác</p>
      </div>
    );
  }

  const isValueAsc = sortConfig?.field === 'value' && sortConfig.order === 'asc';
  const isValueDesc = sortConfig?.field === 'value' && sortConfig.order === 'desc';

  const isTimeAsc = sortConfig?.field === 'time' && sortConfig.order === 'asc';
  const isTimeDesc = sortConfig?.field === 'time' && sortConfig.order === 'desc';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead># ID</TableHead>
          <TableHead>Loại Cảm Biến</TableHead>
          {/* Cột Giá Trị Đo */}
          <TableHead
            onClick={() => onSort && onSort('value')}
            className="cursor-pointer select-none hover:bg-slate-50 transition-colors group"
            title="Sắp xếp theo giá trị đo"
          >
            <div className="inline-flex items-center gap-1.5">
              <span>Giá Trị Đo</span>
              {isValueAsc ? (
                <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
              ) : isValueDesc ? (
                <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              )}
            </div>
          </TableHead>
          <TableHead>Đơn Vị</TableHead>
          {/* Cột Thời Gian Ghi Nhận */}
          <TableHead
            onClick={() => onSort && onSort('time')}
            className="cursor-pointer select-none hover:bg-slate-50 transition-colors group"
            title="Sắp xếp theo thời gian ghi nhận"
          >
            <div className="inline-flex items-center gap-1.5">
              <span>Thời Gian Ghi Nhận</span>
              {isTimeAsc ? (
                <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
              ) : isTimeDesc ? (
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
