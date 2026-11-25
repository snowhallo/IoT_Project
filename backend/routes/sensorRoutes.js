import express from 'express';
import { getSensors, getDataSensors } from '../controllers/sensorController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bắt buộc xác thực JWT Token cho toàn bộ API cảm biến
router.use(verifyToken);

/**
 * @openapi
 * /api/sensors:
 *   get:
 *     summary: Lấy danh sách cấu hình cảm biến và giá trị đo mới nhất
 *     tags:
 *       - Sensors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách cảm biến cùng giá trị hiện thời
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sensor'
 *       401:
 *         description: Không tìm thấy Token xác thực hoặc Token không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/sensors', getSensors);

/**
 * @openapi
 * /api/data-sensors:
 *   get:
 *     summary: Tra cứu log dữ liệu đo đạc cảm biến (Hỗ trợ Lọc loại, Tìm kiếm thời gian cắt dần, Phân trang)
 *     tags:
 *       - Data Sensors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, temperature, humidity, light]
 *           default: all
 *         description: Lọc theo loại cảm biến (temperature, humidity, light hoặc all)
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *           example: '2026-08-16 15'
 *         description: Tìm kiếm theo mốc thời gian dạng tiền tố cắt dần (YYYY, YYYY-MM, YYYY-MM-DD HH:mm:ss...)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số thứ tự trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bản ghi trên một trang
 *     responses:
 *       200:
 *         description: Danh sách log dữ liệu đo đạc sắp xếp giảm dần (DESC) theo thời gian
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DataSensor'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Không tìm thấy Token xác thực hoặc Token không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/data-sensors', getDataSensors);

export default router;

