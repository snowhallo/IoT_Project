import express from 'express';
import cors from 'cors';
import { swaggerUi, swaggerSpec } from './config/swagger.js';
import sensorRoutes from './routes/sensorRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Kiểm tra trạng thái hoạt động của Backend server
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Server hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: online
 *                 system:
 *                   type: string
 *                   example: IoT ESP32 Backend Service
 *                 time:
 *                   type: string
 *                   example: '2026-08-16T08:30:00.000Z'
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'IoT ESP32 Backend Service',
    time: new Date().toISOString(),
  });
});

// Swagger API Documentation UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'IoT ESP32 Smart Home - API Documentation',
    explorer: true,
  })
);

// Endpoint lấy raw Swagger JSON spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Đăng ký các Route chính
app.use('/api', sensorRoutes);
app.use('/api', deviceRoutes);
app.use('/api', historyRoutes);
app.use('/api', userRoutes);

export default app;

