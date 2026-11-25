import http from 'http';
// MQTT Live Sync connected to broker.hivemq.com:1883
import dotenv from 'dotenv';
import app from './app.js';
import { testDbConnection } from './config/db.js';
import { initSocketIO } from './services/socketService.js';
import { initMqttService } from './services/mqttService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// 1. Khởi tạo Socket.IO cho kết nối thời gian thực với Frontend
initSocketIO(server);

// 2. Khởi tạo MQTT Service lắng nghe dữ liệu từ ESP32
initMqttService();

// Khởi chạy HTTP Server
server.listen(PORT, async () => {
  console.log(`[Server] IoT Backend listening on http://localhost:${PORT}`);
  console.log(`[Swagger] API Documentation at http://localhost:${PORT}/api-docs`);

  // Kiểm tra kết nối CSDL MySQL
  await testDbConnection();
});
