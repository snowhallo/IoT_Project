import express from 'express';
import { getDevices, toggleDevice } from '../controllers/deviceController.js';

const router = express.Router();

/**
 * @openapi
 * /api/devices:
 *   get:
 *     summary: Lấy danh sách thiết bị và trạng thái BẬT/TẮT hiện tại
 *     tags:
 *       - Devices
 *     responses:
 *       200:
 *         description: Danh sách các thiết bị trong hệ thống
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
 *                     $ref: '#/components/schemas/Device'
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/devices', getDevices);

/**
 * @openapi
 * /api/devices/{id}/toggle:
 *   post:
 *     summary: Điều khiển BẬT/TẮT thiết bị (Cập nhật DB và Publish lệnh MQTT tới ESP32)
 *     tags:
 *       - Devices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của thiết bị cần điều khiển
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: boolean
 *                 description: true = BẬT thiết bị, false = TẮT thiết bị
 *                 example: true
 *     responses:
 *       200:
 *         description: Gửi lệnh điều khiển thành công và cập nhật trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Đã BẬT thiết bị Đèn LED 1 thành công'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Không tìm thấy thiết bị
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi máy chủ hoặc lỗi gửi MQTT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/devices/:id/toggle', toggleDevice);

export default router;

