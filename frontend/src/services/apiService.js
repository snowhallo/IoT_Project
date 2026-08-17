import dayjs from 'dayjs';

/**
 * API Service Layer cho Frontend
 * Hỗ trợ Dual Mode:
 * - Ưu tiên gọi RESTful API Backend Node.js Express (http://localhost:5000/api)
 * - Tự động Fallback sang Mock Data phong phú nếu Backend chưa bật hoặc có cờ ENABLE_FORCE_MOCK
 */

const API_BASE_URL = 'http://localhost:5000/api';
const ENABLE_MOCK_FALLBACK = true;

// Fallback devices (2 Đèn LED chuẩn phần cứng)
let mockDevices = [
  { id: 1, name: 'Đèn LED 1', type: 'led', pin: 'GPIO 2', status: true, icon: 'Lightbulb', description: 'Đèn chiếu sáng chính (LED 5mm)' },
  { id: 2, name: 'Đèn LED 2', type: 'led', pin: 'GPIO 4', status: false, icon: 'Lightbulb', description: 'Đèn cảnh báo / Chiếu sáng phụ (LED 5mm)' },
];

const now = dayjs();

// Fallback data sensors
const mockDataSensors = Array.from({ length: 30 }).map((_, idx) => {
  const time = now.subtract(idx * 15, 'second').format('YYYY-MM-DD HH:mm:ss');
  const types = [
    { type: 'temperature', sensorName: 'Nhiệt độ', unit: '°C', base: 28.5 },
    { type: 'humidity', sensorName: 'Độ ẩm', unit: '%', base: 68.0 },
    { type: 'light', sensorName: 'Ánh sáng', unit: 'Lux', base: 490 },
  ];
  const chosen = types[idx % 3];
  const val = chosen.type === 'light'
    ? chosen.base + ((idx * 7) % 50)
    : Number((chosen.base + ((idx % 5) * 0.3)).toFixed(1));

  return {
    id: 30 - idx,
    sensorId: (idx % 3) + 1,
    sensorName: chosen.sensorName,
    type: chosen.type,
    value: val,
    unit: chosen.unit,
    timestamp: time,
  };
});

// Fallback history (Action & Status: BẬT / TẮT)
let mockHistory = [
  { id: 16, deviceId: 1, deviceName: 'Đèn LED 1', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss') },
  { id: 15, deviceId: 2, deviceName: 'Đèn LED 2', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss') },
  { id: 14, deviceId: 2, deviceName: 'Đèn LED 2', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(12, 'minute').format('YYYY-MM-DD HH:mm:ss') },
  { id: 13, deviceId: 1, deviceName: 'Đèn LED 1', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(25, 'minute').format('YYYY-MM-DD HH:mm:ss') },
  { id: 12, deviceId: 1, deviceName: 'Đèn LED 1', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(40, 'minute').format('YYYY-MM-DD HH:mm:ss') },
  { id: 11, deviceId: 2, deviceName: 'Đèn LED 2', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 10, deviceId: 2, deviceName: 'Đèn LED 2', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 9, deviceId: 1, deviceName: 'Đèn LED 1', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(3, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 8, deviceId: 1, deviceName: 'Đèn LED 1', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(5, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 7, deviceId: 2, deviceName: 'Đèn LED 2', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(8, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 6, deviceId: 1, deviceName: 'Đèn LED 1', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 5, deviceId: 2, deviceName: 'Đèn LED 2', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss') },
  { id: 4, deviceId: 1, deviceName: 'Đèn LED 1', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(1, 'day').subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 3, deviceId: 2, deviceName: 'Đèn LED 2', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss') },
  { id: 2, deviceId: 1, deviceName: 'Đèn LED 1', action: 'TẮT', status: 'TẮT', timestamp: now.subtract(2, 'day').subtract(4, 'hour').format('YYYY-MM-DD HH:mm:ss') },
  { id: 1, deviceId: 1, deviceName: 'Đèn LED 1', action: 'BẬT', status: 'BẬT', timestamp: now.subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss') },
];

// Helper gọi fetch REST API có timeout
async function fetchApi(endpoint, options = {}, defaultFallback = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success) return json.data;
    }
    return ENABLE_MOCK_FALLBACK ? defaultFallback : null;
  } catch {
    return ENABLE_MOCK_FALLBACK ? defaultFallback : null;
  }
}

export const apiService = {
  // 1. Lấy danh sách cảm biến
  getSensors: async () => {
    return fetchApi('/sensors', { method: 'GET' }, [
      { id: 1, name: 'Nhiệt độ', code: 'temperature', unit: '°C', currentValue: 28.5, minVal: 0, maxVal: 100, color: 'orange' },
      { id: 2, name: 'Độ ẩm', code: 'humidity', unit: '%', currentValue: 68, minVal: 0, maxVal: 100, color: 'cyan' },
      { id: 3, name: 'Ánh sáng', code: 'light', unit: 'Lux', currentValue: 520, minVal: 0, maxVal: 1000, color: 'yellow' },
    ]);
  },

  // 2. Lấy danh sách thiết bị (2 Đèn LED)
  getDevices: async () => {
    return fetchApi('/devices', { method: 'GET' }, mockDevices);
  },

  // 3. Đổi trạng thái thiết bị (BẬT / TẮT)
  toggleDevice: async (deviceId, newStatus) => {
    try {
      await fetchApi(`/devices/${deviceId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      }, null);
    } catch {
      // Backend offline -> Cập nhật mock state
    }

    mockDevices = mockDevices.map((d) =>
      d.id === deviceId ? { ...d, status: newStatus } : d,
    );

    const targetDev = mockDevices.find((d) => d.id === deviceId);
    const actionText = newStatus ? 'BẬT' : 'TẮT';
    const statusText = newStatus ? 'BẬT' : 'TẮT';

    const newLog = {
      id: mockHistory.length + 1,
      deviceId: deviceId,
      deviceName: targetDev?.name || `Thiết bị #${deviceId}`,
      action: actionText,
      status: statusText,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    mockHistory = [newLog, ...mockHistory];

    return mockDevices;
  },

  // 4. Lấy dữ liệu Data Sensors
  getDataSensors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/data-sensors?${query}` : '/data-sensors';
    return fetchApi(url, { method: 'GET' }, mockDataSensors);
  },

  // 5. Lấy lịch sử điều khiển
  getHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/history?${query}` : '/history';
    return fetchApi(url, { method: 'GET' }, mockHistory);
  },

  // 6. Lấy Profile
  getProfile: async () => {
    return fetchApi('/profile', { method: 'GET' }, {
      fullName: 'Nguyễn Tuấn Tài',
      studentId: 'B23DCCN731',
      className: 'D23CQCN03-B',
      school: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
      email: 'TaiNT.B23CN731@stu.ptit.edu.vn',
      avatarUrl: '',
      projectName: 'Hệ Thống Giám Sát Môi Trường & Điều Khiển Thiết Bị IoT (ESP32)',
      description: 'Đo nhiệt độ, độ ẩm, ánh sáng và điều khiển 2 đèn LED qua MQTT.',
      links: {
        github: 'https://github.com/your-username/iot-esp32-project',
        figma: 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1',
        pdfReport: 'https://drive.google.com/file/d/sample-iot-report-pdf/view',
      },
    });
  },

  // 7. Cập nhật Profile
  updateProfile: async (newProfile) => {
    return fetchApi('/profile', {
      method: 'PUT',
      body: JSON.stringify(newProfile),
    }, newProfile);
  },
};
