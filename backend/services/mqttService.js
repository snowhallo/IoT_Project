import { mqttClient } from '../config/mqtt.js';
import { pool } from '../config/db.js';
import { broadcastSensorData } from './socketService.js';

/**
 * MQTT Service:
 * Lắng nghe topic từ ESP32, tự động lưu vào MySQL và phát Socket.IO lên Dashboard
 */
export function initMqttService() {
  const sensorTopic = process.env.MQTT_TOPIC_SENSORS || 'esp32/sensors/data';

  mqttClient.on('message', async (topic, message) => {
    if (topic === sensorTopic) {
      try {
        const payloadStr = message.toString();
        console.log(`[MQTT Data] ${topic}:`, payloadStr);

        const data = JSON.parse(payloadStr);
        // Payload mẫu: { temperature: 29.5, humidity: 68.2, light: 490 }
        const { temperature, humidity, light } = data;

        const now = new Date();
        const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);

        // Lưu Nhiệt độ (sensor_id = 1)
        if (temperature !== undefined) {
          await pool.query(
            'INSERT INTO `data_sensors` (`sensor_id`, `value`, `measured_at`) VALUES (?, ?, ?)',
            [1, Number(temperature), formattedTime]
          );
        }

        // Lưu Độ ẩm (sensor_id = 2)
        if (humidity !== undefined) {
          await pool.query(
            'INSERT INTO `data_sensors` (`sensor_id`, `value`, `measured_at`) VALUES (?, ?, ?)',
            [2, Number(humidity), formattedTime]
          );
        }

        // Lưu Ánh sáng (sensor_id = 3)
        if (light !== undefined) {
          await pool.query(
            'INSERT INTO `data_sensors` (`sensor_id`, `value`, `measured_at`) VALUES (?, ?, ?)',
            [3, Number(light), formattedTime]
          );
        }

        // Phát WebSocket cập nhật tức thì lên Web Dashboard
        broadcastSensorData({
          temperature: Number(temperature),
          humidity: Number(humidity),
          light: Number(light),
          timestamp: formattedTime,
        });

      } catch (err) {
        console.warn('[MQTT Processing Error]:', err.message);
      }
    }
  });
}
