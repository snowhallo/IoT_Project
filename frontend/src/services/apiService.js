/**
 * API Service Layer cho Frontend
 * Giao tiếp 100% với RESTful API Backend Node.js Express (http://localhost:5000/api)
 * Đã loại bỏ hoàn toàn Mock Data và chuyển sang dữ liệu thực từ MySQL & ESP32.
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Helper gọi fetch REST API có timeout và tự động đính kèm JWT Token
async function fetchApi(endpoint, options = {}) {
  const timeoutMs = options.timeout || 7000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = localStorage.getItem('iot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Nếu bị chặn quyền 401 Unauthorized: Xóa token và điều hướng về trang đăng nhập
    if (res.status === 401) {
      localStorage.removeItem('iot_token');
      localStorage.removeItem('iot_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      const err = new Error('Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập.');
      err.status = 401;
      throw err;
    }

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success) {
      return json.data !== undefined ? json.data : json;
    }

    // Nếu Backend trả về lỗi (Ví dụ: 504 Hardware Timeout hoặc 404/500)
    if (json && json.success === false) {
      const err = new Error(json.message || 'Lỗi xử lý từ máy chủ');
      err.status = res.status;
      err.data = json;
      throw err;
    }

    throw new Error(`Yêu cầu thất bại với mã trạng thái ${res.status}`);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Quá thời gian chờ phản hồi từ máy chủ (Timeout)');
      timeoutErr.status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

export const apiService = {
  // 1. Lấy danh sách cảm biến và giá trị mới nhất thực tế từ MySQL
  getSensors: async () => {
    return fetchApi('/sensors', { method: 'GET' });
  },

  // 2. Lấy danh sách thiết bị (Đèn LED) từ MySQL
  getDevices: async () => {
    return fetchApi('/devices', { method: 'GET' });
  },

  // 3. Đổi trạng thái thiết bị (BẬT / TẮT) - Đồng bộ 2 chiều qua MQTT với ESP32
  toggleDevice: async (deviceId, newStatus) => {
    const result = await fetchApi(`/devices/${deviceId}/toggle`, {
      method: 'POST',
      timeout: 6500,
      body: JSON.stringify({ status: newStatus }),
    });

    // Lấy lại danh sách thiết bị cập nhật mới nhất từ CSDL
    const latestDevs = await apiService.getDevices();
    return latestDevs || (result ? [result] : []);
  },

  // 4. Lấy dữ liệu Data Sensors thực tế (hỗ trợ phân trang, lọc loại, tìm kiếm)
  getDataSensors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/data-sensors?${query}` : '/data-sensors';
    return fetchApi(url, { method: 'GET' });
  },

  // 5. Lấy lịch sử điều khiển bật/tắt thiết bị thực tế
  getHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/history?${query}` : '/history';
    return fetchApi(url, { method: 'GET' });
  },

  // 6. Lấy Profile người dùng
  getProfile: async () => {
    return fetchApi('/profile', { method: 'GET' });
  },

  // 7. Cập nhật Profile
  updateProfile: async (newProfile) => {
    return fetchApi('/profile', {
      method: 'PUT',
      body: JSON.stringify(newProfile),
    });
  },

  // 8. Đăng nhập hệ thống (POST /api/auth/login) - Xác thực 100% bằng CSDL MySQL
  login: async (username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.success) {
      return json;
    }

    if (json && !json.success) {
      throw new Error(json.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    }

    throw new Error('Lỗi không xác định khi kết nối tới máy chủ');
  },

  // 9. Lấy thông tin phiên hiện tại (GET /api/auth/me)
  getMe: async () => {
    return fetchApi('/auth/me', { method: 'GET' });
  },

  // 10. Đăng xuất khỏi hệ thống (POST /api/auth/logout)
  logout: async () => {
    try {
      return await fetchApi('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[Logout API] Máy chủ không phản hồi hoặc phiên đã hết:', err.message);
      return null;
    }
  },
};

