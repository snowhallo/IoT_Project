import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';

export const mqttClient = mqtt.connect(brokerUrl, {
  clientId: `iot_backend_${Math.random().toString(16).substring(2, 8)}`,
  clean: true,
  connectTimeout: 5000,
  reconnectPeriod: 3000,
});

mqttClient.on('connect', () => {
  console.log(`[MQTT] Connected to broker: ${brokerUrl}`);
  // Đăng ký nhận dữ liệu từ cảm biến ESP32
  const sensorTopic = process.env.MQTT_TOPIC_SENSORS || 'esp32/sensors/data';
  mqttClient.subscribe(sensorTopic, (err) => {
    if (!err) {
      console.log(`[MQTT] Subscribed to topic: ${sensorTopic}`);
    }
  });
});

mqttClient.on('error', (err) => {
  console.warn('[MQTT Error]:', err.message);
});
