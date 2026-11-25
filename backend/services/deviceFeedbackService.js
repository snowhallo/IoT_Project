import EventEmitter from 'events';

/**
 * Device Feedback Service
 * Quản lý hàng đợi Promise chờ phản hồi ACK từ mạch ESP32 qua topic esp32/device/status
 */

class DeviceFeedbackService extends EventEmitter {
  constructor() {
    super();
    this.pendingRequests = new Map();
  }

  /**
   * Đăng ký chờ phản hồi cho một thao tác điều khiển thiết bị
   * @param {number} deviceId - ID thiết bị
   * @param {string} requestId - Mã yêu cầu duy nhất
   * @param {number} timeoutMs - Thời gian chờ tối đa (mặc định 5000ms)
   * @returns {Promise<object>}
   */
  waitForFeedback(deviceId, requestId, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const key = `${deviceId}_${requestId || 'any'}`;

      const timer = setTimeout(() => {
        this.pendingRequests.delete(key);
        // Also cleanup by deviceId if exists
        this.pendingRequests.delete(`${deviceId}_any`);
        const err = new Error('TIMEOUT_NO_RESPONSE');
        err.message = `Thiết bị (ID: ${deviceId}) không phản hồi sau ${timeoutMs / 1000}s`;
        reject(err);
      }, timeoutMs);

      this.pendingRequests.set(key, { resolve, reject, timer, deviceId, requestId });
    });
  }

  /**
   * Nhận tín hiệu phản hồi từ MQTT esp32/device/status và giải phóng Promise
   * @param {object} feedbackData - { deviceId, status, success, requestId, actualState }
   */
  handleFeedback(feedbackData) {
    const { deviceId, requestId } = feedbackData;
    if (!deviceId) return false;

    // Tìm theo key cụ thể hoặc fallback theo deviceId
    const exactKey = `${deviceId}_${requestId}`;
    const genericKey = `${deviceId}_any`;

    let matched = this.pendingRequests.get(exactKey) || this.pendingRequests.get(genericKey);

    // Nếu không tìm thấy key chính xác, duyệt tìm theo deviceId gần nhất
    if (!matched) {
      for (const [k, v] of this.pendingRequests.entries()) {
        if (v.deviceId === Number(deviceId)) {
          matched = v;
          this.pendingRequests.delete(k);
          break;
        }
      }
    } else {
      this.pendingRequests.delete(exactKey);
      this.pendingRequests.delete(genericKey);
    }

    if (matched) {
      clearTimeout(matched.timer);
      matched.resolve(feedbackData);
      return true;
    }

    return false;
  }
}

export const deviceFeedbackService = new DeviceFeedbackService();
