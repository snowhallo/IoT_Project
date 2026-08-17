import { pool } from '../config/db.js';
import { mqttClient } from '../config/mqtt.js';

/**
 * Device Controller
 * Xử lý lấy danh sách thiết bị và điều khiển BẬT/TẮT 2 chiều (Web -> DB -> MQTT -> ESP32)
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

// 2. Bật / Tắt thiết bị
export async function toggleDevice(req, res) {
  try {
    const deviceId = Number(req.params.id);
    const { status } = req.body; // true (BẬT) hoặc false (TẮT)
    const newStatusInt = status ? 1 : 0;
    const actionText = status ? 'BẬT' : 'TẮT';
    const statusText = status ? 'BẬT' : 'TẮT';

    // 1. Lấy thông tin thiết bị
    const [devices] = await pool.query('SELECT * FROM `devices` WHERE `id` = ?', [deviceId]);
    if (devices.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị' });
    }
    const device = devices[0];

    // 2. Cập nhật trạng thái trong bảng `devices`
    await pool.query('UPDATE `devices` SET `status` = ? WHERE `id` = ?', [newStatusInt, deviceId]);

    // 3. Ghi log vào bảng `history`
    await pool.query(
      'INSERT INTO `history` (`device_id`, `user_id`, `action`, `status`, `created_at`) VALUES (?, ?, ?, ?, NOW())',
      [deviceId, 1, actionText, statusText]
    );

    // 4. Publish lệnh điều khiển qua MQTT tới ESP32
    const controlPayload = JSON.stringify({
      deviceId: device.id,
      deviceName: device.device_name,
      pin: device.pin_gpio,
      action: actionText,
      status: newStatusInt,
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

    return res.status(200).json({
      success: true,
      message: `Đã ${actionText} thiết bị ${device.device_name} thành công`,
      data: {
        id: deviceId,
        status: Boolean(newStatusInt),
      },
    });
  } catch (error) {
    console.error('Error in toggleDevice:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi điều khiển thiết bị', error: error.message });
  }
}
