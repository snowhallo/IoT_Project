import React from 'react';
import Card from '../common/Card';
import Switch from '../common/Switch';
import { Lightbulb, Loader2 } from 'lucide-react';

export default function DeviceControl({
  devices = [],
  loadingStates = {},
  onToggle,
}) {
  const visibleDevices = devices;

  const handleToggle = (id, newStatus) => {
    if (onToggle && !loadingStates[id]) {
      onToggle(id, newStatus);
    }
  };

  return (
    <Card
      title="Bảng Điều Khiển Thiết Bị"
      subtitle="Điều khiển bật/tắt 4 đèn LED qua ESP32"
      className="p-3.5 md:p-4 h-full"
      headerClassName="pb-1.5 mb-2.5"
      action={
        <span className="text-xs text-slate-500 font-medium">
          {visibleDevices.filter((d) => d.status).length}/{visibleDevices.length} Thiết bị đang BẬT
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleDevices.map((device) => {
          const isOn = Boolean(device.status);
          const isLoading = Boolean(loadingStates[device.id]);

          return (
            <div
              key={device.id}
              className="p-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isOn
                        ? 'bg-amber-50 border-amber-200 text-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Lightbulb
                      className={`w-4 h-4 transition-colors ${
                        isOn ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-semibold text-slate-800">{device.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{device.pin}</p>
                  </div>
                </div>

                {isLoading && (
                  <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang xử lý...
                  </span>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {device.description || 'Đèn LED'}
                </span>
                <Switch
                  checked={isOn}
                  loading={isLoading}
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

