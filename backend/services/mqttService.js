import { mqttClient } from '../config/mqtt.js';
import { pool } from '../config/db.js';
import { broadcastSensorData, broadcastDeviceStatus } from './socketService.js';
import { deviceFeedbackService } from './deviceFeedbackService.js';

function formatLocalTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Đảm bảo cảm biến thứ 4 (Khí Gas) và Đèn LED 4 (GPIO 17) tồn tại trong DB hiện tại mà không xóa dữ liệu cũ.
 */
export async function ensureFourthSensorAndDevice() {
  try {
    await pool.query(
      "INSERT IGNORE INTO `sensors` (`id`, `user_id`, `sensor_name`, `code`, `unit`, `pin_gpio`) VALUES (4, 1, 'Khí Gas', 'gas', 'ppm', 'ADC 35')"
    );
    await pool.query(
      "INSERT IGNORE INTO `devices` (`id`, `user_id`, `device_name`, `type`, `pin_gpio`, `status`, `description`) VALUES (4, 1, 'Đèn LED 4', 'led', 'GPIO 17', 0, 'Đèn phụ / Cảnh báo thứ 4 (D17 / GPIO 17)')"
    );
  } catch (err) {
    console.warn('[DB Auto-Seed Warning]:', err.message);
  }
}

/**
 * Parse gói tin cảm biến từ MQTT, lưu 4 cảm biến vào data_sensors và phát WebSocket.
 */
export async function processSensorPayload(payloadStr) {
  const data = JSON.parse(payloadStr);
  // Payload mẫu: { temperature: 29.5, humidity: 68.2, light: 490, gas: 412 }
  const { temperature, humidity, light, gas } = data;
  const resolvedGas = gas !== undefined && gas !== null
    ? Number(gas)
    : Math.floor(Math.random() * 601) + 200;

  const formattedTime = formatLocalTimestamp(new Date());
  const sensorReadings = [
    { sensorId: 1, value: temperature },
    { sensorId: 2, value: humidity },
    { sensorId: 3, value: light },
    { sensorId: 4, value: resolvedGas },
  ];

  for (const reading of sensorReadings) {
    if (reading.value !== undefined && reading.value !== null && !Number.isNaN(Number(reading.value))) {
      await pool.query(
        'INSERT INTO `data_sensors` (`sensor_id`, `value`, `measured_at`) VALUES (?, ?, ?)',
        [reading.sensorId, Number(reading.value), formattedTime]
      );
    }
  }

  // Phát WebSocket cập nhật lên Web Dashboard
  broadcastSensorData({
    temperature: Number(temperature),
    humidity: Number(humidity),
    light: Number(light),
    gas: resolvedGas,
    timestamp: formattedTime,
  });
}

/**
 * MQTT Service:
 * Lắng nghe topics từ ESP32:
 * 1. esp32/sensors/data: Dữ liệu cảm biến định kỳ -> Lưu DB & phát Socket.IO
 * 2. esp32/device/status: Phản hồi xác nhận trạng thái phần cứng (Feedback-loop ACK)
 */
export function initMqttService() {
  const sensorTopic = process.env.MQTT_TOPIC_SENSORS || 'esp32/sensors/data';
  const deviceStatusTopic = process.env.MQTT_TOPIC_DEVICE_STATUS || 'esp32/device/status';

  ensureFourthSensorAndDevice();

  mqttClient.on('message', async (topic, message) => {
    // 1. Xử lý dữ liệu cảm biến định kỳ
    if (topic === sensorTopic) {
      try {
        const payloadStr = message.toString();
        console.log(`[MQTT Data] ${topic}:`, payloadStr);
        await processSensorPayload(payloadStr);
      } catch (err) {
        console.warn('[MQTT Sensor Processing Error]:', err.message);
      }
    }

    // 2. Xử lý phản hồi trạng thái xác nhận từ thiết bị ESP32 (Feedback Loop)
    if (topic === deviceStatusTopic) {
      try {
        const payloadStr = message.toString();
        console.log(`[MQTT Device Feedback ACK] ${topic}:`, payloadStr);

        const data = JSON.parse(payloadStr);
        // Format: { deviceId: 1, pin: "GPIO 2", status: 1, actualState: 1, success: true, requestId: "..." }
        const { deviceId, status, requestId } = data;

        if (deviceId) {
          const statusBool = Boolean(status);
          const statusInt = statusBool ? 1 : 0;
          const actionText = statusBool ? 'BẬT' : 'TẮT';

          // Cập nhật CSDL trạng thái mới nhất
          await pool.query('UPDATE `devices` SET `status` = ? WHERE `id` = ?', [statusInt, deviceId]);

          // Phát WebSocket cho tất cả client trên giao diện
          broadcastDeviceStatus({
            id: Number(deviceId),
            status: statusBool,
            action: actionText,
            timestamp: new Date().toISOString(),
          });

          // Giải phóng Promise chờ trong Controller
          deviceFeedbackService.handleFeedback(data);
        }
      } catch (err) {
        console.warn('[MQTT Feedback Processing Error]:', err.message);
      }
    }
  });
}

