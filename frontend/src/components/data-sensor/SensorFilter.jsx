import React from 'react';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function SensorFilter({ selectedType, onSelectType }) {
  const options = [
    { value: 'all', label: 'Tất cả cảm biến' },
    { value: 'temperature', label: 'Nhiệt độ (Temperature)' },
    { value: 'humidity', label: 'Độ ẩm (Humidity)' },
    { value: 'light', label: 'Ánh sáng (Light)' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 min-w-[220px]">
        <Filter className="w-4 h-4 text-blue-600 shrink-0" />
        <Select value={selectedType} onValueChange={onSelectType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn loại cảm biến" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
