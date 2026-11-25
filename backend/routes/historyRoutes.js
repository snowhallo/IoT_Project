import express from 'express';
import { getHistory } from '../controllers/historyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bắt buộc xác thực JWT Token cho toàn bộ API lịch sử điều khiển
router.use(verifyToken);

/**
 * @openapi
 * /api/history:
 *   get:
 *     summary: Tra cứu lịch sử điều khiển thiết bị (Bắt buộc chuẩn 5 cột dữ liệu)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: 'Đèn'
 *         description: Tìm kiếm theo Tên thiết bị HOẶC theo Mốc thời gian (Prefix match)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [all, BẬT, TẮT]
 *           default: all
 *         description: Lọc theo hành động BẬT hoặc TẮT
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
 *         description: Danh sách lịch sử điều khiển 5 cột (ID, Tên thiết bị, Hành động, Trạng thái, Thời gian)
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
 *                     $ref: '#/components/schemas/HistoryItem'
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
router.get('/history', getHistory);

export default router;

