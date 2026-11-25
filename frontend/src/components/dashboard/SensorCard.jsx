import React from 'react';
import { Thermometer, Droplets, Sun, Wind } from 'lucide-react';
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
    gas: {
      bgIcon: 'bg-purple-50 text-purple-600 border border-purple-200',
      textColor: 'text-purple-600',
      IconComponent: Wind,
    },
  };

  const config = themeConfig[code] || themeConfig.temperature;
  const Icon = config.IconComponent;

  return (
    <Card className="hover:border-slate-300 transition-all p-3.5 md:p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs md:text-sm font-semibold text-slate-600">{name}</h4>
          {/* Giá trị số lớn */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${config.textColor}`}>
              {typeof currentValue === 'number' ? currentValue.toLocaleString() : currentValue}
            </span>
            <span className="text-sm md:text-base font-bold text-slate-500">{unit}</span>
          </div>
        </div>

        {/* Icon hộp màu */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgIcon} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
