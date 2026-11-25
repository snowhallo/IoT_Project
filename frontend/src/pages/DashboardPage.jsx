import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "../components/common/Header";
import Card from "../components/common/Card";
import SensorCard from "../components/dashboard/SensorCard";
import SingleSensorChart from "../components/dashboard/SingleSensorChart";
import DeviceControl from "../components/dashboard/DeviceControl";
import { apiService } from "../services/apiService";
import { formatTimeOnly } from "../utils/timeSearchHelper";

const SENSOR_CHART_CONFIGS = [
  {
    code: "temperature",
    title: "Biểu đồ Nhiệt độ",
    unit: "°C",
    color: "#ea580c",
    gradientId: "colorTempSingle",
    domain: [0, 60],
  },
  {
    code: "humidity",
    title: "Biểu đồ Độ ẩm",
    unit: "%",
    color: "#06b6d4",
    gradientId: "colorHumSingle",
    domain: [0, 100],
  },
  {
    code: "light",
    title: "Biểu đồ Ánh sáng",
    unit: "Lux",
    color: "#eab308",
    gradientId: "colorLightSingle",
    domain: [0, (dataMax) => Math.max(Math.ceil((dataMax || 0) / 500) * 500, 1000)],
  },
  {
    code: "gas",
    title: "Biểu đồ Khí Gas",
    unit: "ppm",
    color: "#8b5cf6",
    gradientId: "colorGasSingle",
    domain: [0, 1000],
  },
];

export default function DashboardPage() {
  const [sensors, setSensors] = useState([
    { id: 1, name: "Nhiệt độ", code: "temperature", unit: "°C", currentValue: 0 },
    { id: 2, name: "Độ ẩm", code: "humidity", unit: "%", currentValue: 0 },
    { id: 3, name: "Ánh sáng", code: "light", unit: "Lux", currentValue: 0 },
    { id: 4, name: "Khí Gas", code: "gas", unit: "ppm", currentValue: 0 },
  ]);
  const [chartData, setChartData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState({});

  // Load cảm biến và thiết bị từ backend & Cập nhật Real-time (100% dữ liệu thực)
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        // 1. Tải danh sách cảm biến và giá trị mới nhất thực tế từ MySQL
        const sensorList = await apiService.getSensors();
        if (isMounted && Array.isArray(sensorList) && sensorList.length > 0) {
          setSensors(sensorList);
        }

        // 2. Tải danh sách thiết bị (Đèn LED) thực tế
        const devList = await apiService.getDevices();
        if (isMounted && Array.isArray(devList) && devList.length > 0) {
          setDevices(devList);
        }

        // 3. Tải các bản ghi đo đạc gần nhất từ CSDL thực tế để khởi tạo 4 biểu đồ
        const rawHistory = await apiService.getDataSensors({
          limit: 40,
          page: 1,
        });
        const records = Array.isArray(rawHistory)
          ? rawHistory
          : rawHistory?.records || rawHistory?.data || [];

        if (isMounted && records && records.length > 0) {
          const pointsMap = {};
          records.forEach((r) => {
            const timeLabel = formatTimeOnly(
              new Date(r.measured_at || r.timestamp),
            );
            if (!pointsMap[timeLabel]) {
              pointsMap[timeLabel] = {
                time: timeLabel,
                temperature: null,
                humidity: null,
                light: null,
                gas: null,
              };
            }
            const val = Number(r.value);
            const sensorKey = r.type || r.code;
            if (sensorKey in pointsMap[timeLabel]) {
              pointsMap[timeLabel][sensorKey] = val;
            }
          });

          const initialPoints = Object.values(pointsMap).reverse().slice(-15);
          if (initialPoints.length > 0) {
            setChartData(initialPoints);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu ban đầu từ Backend:", err);
      }
    };

    loadInitialData();

    // Định kỳ lấy dữ liệu mới nhất từ CSDL mỗi 3s
    const interval = setInterval(async () => {
      try {
        const sensorList = await apiService.getSensors();
        if (isMounted && Array.isArray(sensorList) && sensorList.length > 0) {
          setSensors(sensorList);

          const sensorValueByCode = (code) => {
            const found = sensorList.find((s) => s.code === code);
            return found?.currentValue !== undefined ? Number(found.currentValue) : null;
          };

          const tempVal = sensorValueByCode("temperature");
          const humVal = sensorValueByCode("humidity");
          const lightVal = sensorValueByCode("light");
          const gasVal = sensorValueByCode("gas");

          // Chỉ bổ sung điểm đo mới khi có dữ liệu đo đạc thực tế
          if (tempVal !== null || humVal !== null || lightVal !== null || gasVal !== null) {
            const newPoint = {
              time: formatTimeOnly(new Date()),
              temperature: tempVal,
              humidity: humVal,
              light: lightVal,
              gas: gasVal,
            };

            setChartData((prev) => {
              const next = [...prev, newPoint];
              return next.length > 15 ? next.slice(next.length - 15) : next;
            });
          }
        }
      } catch (err) {
        console.error("Lỗi định kỳ tải cảm biến:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Xử lý bật/tắt thiết bị theo mô hình Feedback-Loop ACK (Có hiệu ứng Loading)
  const handleToggleDevice = async (deviceId, newStatus) => {
    const targetDev = devices.find((d) => d.id === deviceId);
    const devName = targetDev?.name || `Thiết bị #${deviceId}`;
    const actionText = newStatus ? "BẬT" : "TẮT";

    // 1. Bật trạng thái Loading trên nút bấm của thiết bị
    setLoadingDevices((prev) => ({ ...prev, [deviceId]: true }));

    try {
      // 2. Gửi yêu cầu qua REST API Backend (Backend sẽ đợi ESP32 phản hồi qua MQTT)
      const updated = await apiService.toggleDevice(deviceId, newStatus);
      if (updated && updated.length > 0) {
        setDevices(updated);
        toast.success(`Đã ${actionText.toLowerCase()} ${devName}`);
      }
    } catch (err) {
      console.error("Toggle device failed:", err);
      toast.error(err.message || `Lỗi điều khiển ${devName}`);
    } finally {
      // 3. Tắt trạng thái Loading
      setLoadingDevices((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  return (
    <div className="space-y-3 md:space-y-3.5">
      {/* Header trang */}
      <Header
        title="Bảng Điều Khiển"
        subtitle="Theo dõi thông số cảm biến và điều khiển thiết bị"
      />

      {/* 1. Phần trên (4 đồ thị): Lưới 2 hàng x 2 cột cho 4 cảm biến */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3.5">
        {SENSOR_CHART_CONFIGS.map((cfg) => {
          const matchedSensor = sensors.find((s) => s.code === cfg.code);
          return (
            <SingleSensorChart
              key={cfg.code}
              title={cfg.title}
              unit={cfg.unit}
              dataKey={cfg.code}
              color={cfg.color}
              gradientId={cfg.gradientId}
              domain={cfg.domain}
              chartData={chartData}
              latestValue={matchedSensor?.currentValue ?? null}
            />
          );
        })}
      </div>

      {/* 2. Phần dưới: Nửa trái 4 ô giá trị mới nhất (2x2), nửa phải 4 đèn bật/tắt (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-3.5 items-stretch">
        <Card
          title="Giá Trị Cảm Biến Mới Nhất"
          subtitle="Cập nhật thời gian thực từ 4 cảm biến"
          className="p-3.5 md:p-4 h-full"
          headerClassName="pb-1.5 mb-2.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sensors.map((sensor) => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </Card>

        <DeviceControl
          devices={devices}
          loadingStates={loadingDevices}
          onToggle={handleToggleDevice}
        />
      </div>
    </div>
  );
}
