import React from 'react';
import { Thermometer, Droplets, Sun } from 'lucide-react';
import Card from '../common/Card';

export default function SensorCard({ sensor }) {
  const {
    name,
    code,
    unit,
    currentValue,
  } = sensor;

  const themeConfig = {
    temperature: {
      bgIcon: 'bg-orange-50 text-orange-600 border border-orange-200',
      textColor: 'text-orange-600',
      IconComponent: Thermometer,
    },
    humidity: {
      bgIcon: 'bg-blue-50 text-blue-600 border border-blue-200',
      textColor: 'text-blue-600',
      IconComponent: Droplets,
    },
    light: {
      bgIcon: 'bg-amber-50 text-amber-600 border border-amber-200',
      textColor: 'text-amber-600',
      IconComponent: Sun,
    },
  };

  const config = themeConfig[code] || themeConfig.temperature;
  const Icon = config.IconComponent;

  return (
    <Card className="hover:border-slate-300 transition-all p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-600">{name}</h4>
          {/* Giá trị số lớn */}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-3xl font-extrabold tracking-tight ${config.textColor}`}>
              {typeof currentValue === 'number' ? currentValue.toLocaleString() : currentValue}
            </span>
            <span className="text-base font-bold text-slate-500">{unit}</span>
          </div>
        </div>

        {/* Icon hộp màu */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bgIcon} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
