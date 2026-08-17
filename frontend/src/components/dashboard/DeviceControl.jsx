import React from 'react';
import Card from '../common/Card';
import Switch from '../common/Switch';
import Badge from '../common/Badge';
import { Lightbulb } from 'lucide-react';

export default function DeviceControl({ devices = [], onToggle }) {
  const handleToggle = (id, newStatus) => {
    if (onToggle) onToggle(id, newStatus);
  };

  return (
    <Card
      title="Bảng Điều Khiển Thiết Bị"
      subtitle="Gửi lệnh bật/tắt thiết bị chấp hành tới kit ESP32 qua giao thức MQTT"
      action={
        <span className="text-xs text-slate-500 font-medium">
          {devices.filter((d) => d.status).length}/{devices.length} Thiết bị đang BẬT
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((device) => {
          const isOn = Boolean(device.status);

          return (
            <div
              key={device.id}
              className={`p-4 rounded-xl border transition-all ${
                isOn
                  ? 'bg-amber-50/30 border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isOn
                        ? 'bg-amber-100 border border-amber-200 text-amber-600'
                        : 'bg-slate-100 border border-slate-200 text-slate-400'
                    }`}
                  >
                    <Lightbulb
                      className={`w-6 h-6 transition-colors ${
                        isOn ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{device.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{device.pin}</p>
                  </div>
                </div>

                <Badge variant={isOn ? 'warning' : 'default'} size="sm">
                  {isOn ? 'BẬT' : 'TẮT'}
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate mr-2">
                  {device.description || 'Bóng đèn LED chấp hành'}
                </span>
                <Switch
                  checked={isOn}
                  onChange={(checked) => handleToggle(device.id, checked)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
