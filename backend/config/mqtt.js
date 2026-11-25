import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';

const mqttOptions = {
  clientId: `iot_backend_${Math.random().toString(16).substring(2, 8)}`,
  clean: true,
  connectTimeout: 5000,
  reconnectPeriod: 3000,
};

if (process.env.MQTT_USERNAME) {
  mqttOptions.username = process.env.MQTT_USERNAME;
}
if (process.env.MQTT_PASSWORD) {
  mqttOptions.password = process.env.MQTT_PASSWORD;
}

export const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

mqttClient.on('connect', () => {
  console.log(`[MQTT] Connected to broker: ${brokerUrl}`);
  // 1. Đăng ký nhận dữ liệu từ cảm biến ESP32
  const sensorTopic = process.env.MQTT_TOPIC_SENSORS || 'esp32/sensors/data';
  mqttClient.subscribe(sensorTopic, (err) => {
    if (!err) {
      console.log(`[MQTT] Subscribed to topic: ${sensorTopic}`);
    }
  });

  // 2. Đăng ký nhận phản hồi trạng thái xác nhận từ thiết bị ESP32 (Feedback Loop)
  const deviceStatusTopic = process.env.MQTT_TOPIC_DEVICE_STATUS || 'esp32/device/status';
  mqttClient.subscribe(deviceStatusTopic, { qos: 1 }, (err) => {
    if (!err) {
      console.log(`[MQTT] Subscribed to topic: ${deviceStatusTopic}`);
    }
  });
});

mqttClient.on('error', (err) => {
  console.warn('[MQTT Error]:', err.message);
});
