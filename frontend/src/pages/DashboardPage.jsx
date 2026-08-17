import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '../components/common/Header';
import SensorCard from '../components/dashboard/SensorCard';
import EnvChart from '../components/dashboard/EnvChart';
import DeviceControl from '../components/dashboard/DeviceControl';
import { apiService } from '../services/apiService';
import { formatTimeOnly } from '../utils/timeSearchHelper';

export default function DashboardPage() {
  const [sensors, setSensors] = useState([
    { id: 1, name: 'Nhiệt độ', code: 'temperature', unit: '°C', currentValue: 28.5, minVal: 0, maxVal: 100, color: 'orange' },
    { id: 2, name: 'Độ ẩm', code: 'humidity', unit: '%', currentValue: 65, minVal: 0, maxVal: 100, color: 'cyan' },
    { id: 3, name: 'Ánh sáng', code: 'light', unit: 'Lux', currentValue: 450, minVal: 0, maxVal: 1000, color: 'yellow' },
  ]);
  const [chartData, setChartData] = useState(() => {
    // Khởi tạo 7 điểm ban đầu cho biểu đồ
    const now = Date.now();
    return Array.from({ length: 7 }).map((_, i) => {
      const t = new Date(now - (6 - i) * 3000);
      return {
        time: formatTimeOnly(t),
        temperature: 28 + Math.round((Math.random() * 2 - 1) * 10) / 10,
        humidity: 65 + Math.round(Math.random() * 6 - 3),
        light: 450 + Math.round(Math.random() * 80 - 40),
      };
    });
  });
  const [devices, setDevices] = useState([]);

  // Load cảm biến và thiết bị từ backend & Cập nhật Real-time
  useEffect(() => {
    const loadInitialData = async () => {
      const sensorList = await apiService.getSensors();
      if (sensorList && sensorList.length > 0) {
        setSensors(sensorList);
      }

      const devList = await apiService.getDevices();
      if (devList && devList.length > 0) setDevices(devList);
    };
    loadInitialData();

    // Định kỳ cập nhật mỗi 3s (không reload trang)
    const interval = setInterval(async () => {
      const sensorList = await apiService.getSensors();
      if (sensorList && sensorList.length > 0) {
        setSensors(sensorList);

        const tempVal = sensorList.find((s) => s.code === 'temperature')?.currentValue ?? 28;
        const humVal = sensorList.find((s) => s.code === 'humidity')?.currentValue ?? 65;
        const lightVal = sensorList.find((s) => s.code === 'light')?.currentValue ?? 450;

        const newPoint = {
          time: formatTimeOnly(new Date()),
          temperature: typeof tempVal === 'number' ? tempVal : Number(tempVal),
          humidity: typeof humVal === 'number' ? humVal : Number(humVal),
          light: typeof lightVal === 'number' ? lightVal : Number(lightVal),
        };

        setChartData((prev) => {
          const next = [...prev, newPoint];
          return next.length > 15 ? next.slice(next.length - 15) : next;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý bật/tắt thiết bị kèm Toast từ thư viện sonner
  const handleToggleDevice = async (deviceId, newStatus) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    const devName = targetDev?.name || `Thiết bị #${deviceId}`;
    const actionText = newStatus ? 'BẬT' : 'TẮT';

    try {
      const updated = await apiService.toggleDevice(deviceId, newStatus);
      if (updated) {
        setDevices(updated);
        toast.success(`Đã gửi lệnh ${actionText} ${devName} thành công!`);
      }
    } catch {
      toast.error(`Gửi lệnh ${actionText} ${devName} thất bại. Vui lòng thử lại!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <Header
        title="Tổng Quan Hệ Thống (Dashboard)"
        subtitle="Giám sát các thông số môi trường theo thời gian thực và điều khiển thiết bị"
      />

      {/* 1. Hàng 1: Ba thẻ cảm biến môi trường */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>

      {/* 2. Hàng 2: Biểu đồ môi trường toàn màn hình (Full Width) */}
      <div>
        <EnvChart chartData={chartData} />
      </div>

      {/* 3. Hàng 3: Khối điều khiển bật/tắt thiết bị đặt bên dưới biểu đồ */}
      <div>
        <DeviceControl devices={devices} onToggle={handleToggleDevice} />
      </div>
    </div>
  );
}
