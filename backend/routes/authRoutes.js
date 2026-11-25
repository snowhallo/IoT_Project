import express from 'express';
import { login, getMe, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống IoT và nhận JWT Token
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: 'nguyentuantai'
 *               password:
 *                 type: string
 *                 example: 'b23dccn731'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về JWT Token
 *       400:
 *         description: Thiếu thông tin đăng nhập
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin tài khoản phiên hiện tại (Yêu cầu JWT Token)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng hiện tại
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.get('/me', verifyToken, getMe);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất khỏi hệ thống IoT (Yêu cầu JWT Token)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công khỏi hệ thống
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.post('/logout', verifyToken, logout);

export default router;
