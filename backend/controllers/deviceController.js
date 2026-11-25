import { pool } from '../config/db.js';
import { mqttClient } from '../config/mqtt.js';
import { deviceFeedbackService } from '../services/deviceFeedbackService.js';

/**
 * Device Controller
 * Xử lý lấy danh sách thiết bị và điều khiển BẬT/TẮT 2 chiều (Web -> MQTT Control -> ESP32 Hardware -> MQTT Status ACK -> DB -> Web)
 */

// 1. Lấy danh sách thiết bị
export async function getDevices(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM `devices` ORDER BY `id` ASC');
    const formatted = rows.map((d) => ({
      id: d.id,
      name: d.device_name,
      type: d.type,
      pin: d.pin_gpio,
      status: Boolean(d.status),
      description: d.description,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error in getDevices:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thiết bị', error: error.message });
  }
}

async function insertHistoryLog(deviceId, actionText, finalStatus) {
  await pool.query(
    'INSERT INTO `history` (`device_id`, `user_id`, `action`, `status`, `created_at`) VALUES (?, ?, ?, ?, NOW())',
    [deviceId, 1, actionText, finalStatus]
  );
}

// 2. Bật / Tắt thiết bị (Mô hình Feedback-Loop ACK 2 chiều có timeout 5s)
export async function toggleDevice(req, res) {
  try {
    const deviceId = Number(req.params.id);
    const { status } = req.body; // true (BẬT) hoặc false (TẮT)
    const newStatusInt = status ? 1 : 0;
    const actionText = status ? 'BẬT' : 'TẮT';

    // 1. Lấy thông tin thiết bị từ CSDL
    const [devices] = await pool.query('SELECT * FROM `devices` WHERE `id` = ?', [deviceId]);
    if (devices.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
    }
    const device = devices[0];

    // Tạo mã requestId duy nhất cho phiên điều khiển này
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Thiết lập bộ chờ phản hồi ACK từ mạch ESP32 (Thời gian chờ tối đa 5000ms)
    const feedbackPromise = deviceFeedbackService.waitForFeedback(deviceId, requestId, 5000);

    // 3. Publish lệnh điều khiển qua MQTT tới topic esp32/device/control
    const controlPayload = JSON.stringify({
      deviceId: device.id,
      deviceName: device.device_name,
      pin: device.pin_gpio,
      action: actionText,
      status: newStatusInt,
      requestId: requestId,
      timestamp: new Date().toISOString(),
    });

    const controlTopic = process.env.MQTT_TOPIC_CONTROL || 'esp32/device/control';
    mqttClient.publish(controlTopic, controlPayload, { qos: 1 }, (err) => {
      if (err) {
        console.warn('[MQTT Publish Error]:', err.message);
      } else {
        console.log(`[MQTT Command] Sent to ${controlTopic}:`, controlPayload);
      }
    });

    // 4. Chờ mạch ESP32 phản hồi xác nhận qua topic esp32/device/status
    try {
      const feedback = await feedbackPromise;
      console.log(`[Device Control] Hardware ACK received for device #${deviceId}:`, feedback);

      // 5. Khi nhận xác nhận từ phần cứng: ghi nhận lịch sử BẬT/TẮT và cập nhật trạng thái thiết bị
      await insertHistoryLog(deviceId, actionText, actionText);
      await pool.query('UPDATE `devices` SET `status` = ? WHERE `id` = ?', [newStatusInt, deviceId]);

      return res.status(200).json({
        success: true,
        message: `Đã ${actionText} thiết bị ${device.device_name} thành công (Đã xác nhận phản hồi từ phần cứng)`,
        data: {
          id: deviceId,
          status: Boolean(newStatusInt),
          ack: true,
        },
      });
    } catch (timeoutErr) {
      console.warn(`[Device Control Timeout] No ACK from ESP32 for device #${deviceId}:`, timeoutErr.message);

      // Nếu không nhận được ACK sau 5 giây (Timeout), ghi nhận lịch sử với trạng thái 'TIMEOUT'
      try {
        await insertHistoryLog(deviceId, actionText, 'TIMEOUT');
      } catch (histErr) {
        console.error('Error inserting TIMEOUT in history:', histErr.message);
      }

      // Trả về mã lỗi 504 Gateway Timeout báo rõ mạch ESP32 chưa phản hồi
      return res.status(504).json({
        success: false,
        message: `Mạch ESP32 không phản hồi xác nhận cho ${device.device_name} sau 5 giây. Vui lòng kiểm tra nguồn điện và kết nối Wi-Fi của kit vi điều khiển!`,
        error: 'HARDWARE_TIMEOUT',
      });
    }
  } catch (error) {
    console.error('Error in toggleDevice:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi điều khiển thiết bị', error: error.message });
  }
}

