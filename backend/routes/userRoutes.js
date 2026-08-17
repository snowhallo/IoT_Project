import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = express.Router();

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Lấy thông tin cá nhân sinh viên và 3 liên kết tài nguyên (Github, Figma, PDF Report)
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Thông tin hồ sơ sinh viên
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Không tìm thấy thông tin sinh viên
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Cập nhật thông tin hồ sơ sinh viên
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: 'Nguyễn Tuấn Tài'
 *               studentId:
 *                 type: string
 *                 example: 'B23DCCN731'
 *               className:
 *                 type: string
 *                 example: 'D23CQCN03-B'
 *               school:
 *                 type: string
 *                 example: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)'
 *               links:
 *                 type: object
 *                 properties:
 *                   github:
 *                     type: string
 *                     example: 'https://github.com/your-username/iot-esp32-project'
 *                   figma:
 *                     type: string
 *                     example: 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1'
 *                   pdfReport:
 *                     type: string
 *                     example: 'https://drive.google.com/file/d/sample-iot-report-pdf/view'
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
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
 *                   example: 'Cập nhật thông tin sinh viên thành công'
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;

