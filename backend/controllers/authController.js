import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ptit_iot_secret_key_2026_b23dccn731';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Thông tin tài khoản mẫu dự phòng khi CSDL chưa khởi chạy (Fallback Demo)
const DEFAULT_DEMO_USER = {
  id: 1,
  username: 'nguyentuantai',
  password: 'b23dccn731',
  full_name: 'Nguyễn Tuấn Tài',
  student_id: 'B23DCCN731',
  class_name: 'D23CQCN03-B',
  school: 'Học viện Công nghệ Bưu chính Viễn thông',
  avatar_url: '/avatar.JPG',
  github_link: 'https://github.com/snowhallo/IoT_Project',
  figma_link: 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1',
  pdf_link: 'https://drive.google.com/drive/u/1/folders/1vq5omX9j8ebJ3Qua_N4YeqqL9p5pguI5',
};

/**
 * Auth Controller
 * Xử lý Đăng nhập, Tạo JWT Token và Kiểm tra thông tin phiên
 */

// 1. Xử lý Đăng nhập (POST /api/auth/login)
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.',
      });
    }

    let user = null;

    try {
      // 1. Truy vấn thông tin người dùng từ CSDL MySQL
      const [rows] = await pool.query(
        'SELECT id, username, password, full_name, student_id, class_name, school, avatar_url, github_link, figma_link, pdf_link FROM `users` WHERE `username` = ? LIMIT 1',
        [username.trim()]
      );

      if (rows.length > 0) {
        user = rows[0];
      }
    } catch (dbErr) {
      console.warn('[Auth Warning] Không thể kết nối CSDL MySQL, chuyển sang chế độ đối soát tài khoản mẫu:', dbErr.message);
      if (username.trim() === DEFAULT_DEMO_USER.username) {
        user = DEFAULT_DEMO_USER;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    // 2. Kiểm tra mật khẩu (hỗ trợ hash bcrypt hoặc mật khẩu seed)
    let isPasswordMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      isPasswordMatch = (user.password === password);
    }

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    // 3. Khởi tạo Payload và ký phát JWT Token
    const payload = {
      id: user.id,
      username: user.username,
      studentId: user.student_id,
      fullName: user.full_name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công vào hệ thống IoT!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        studentId: user.student_id,
        className: user.class_name,
        school: user.school,
        avatarUrl: user.avatar_url || '/avatar.JPG',
        links: {
          github: user.github_link,
          figma: user.figma_link,
          pdfReport: user.pdf_link,
        },
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ trong quá trình xác thực đăng nhập.',
      error: error.message,
    });
  }
}

// 2. Lấy thông tin phiên hiện tại (GET /api/auth/me)
export async function getMe(req, res) {
  try {
    const userId = req.user.id;
    let user = null;

    try {
      const [rows] = await pool.query(
        'SELECT id, username, full_name, student_id, class_name, school, avatar_url, github_link, figma_link, pdf_link FROM `users` WHERE `id` = ? LIMIT 1',
        [userId]
      );
      if (rows.length > 0) {
        user = rows[0];
      }
    } catch {
      // Fallback
    }

    if (!user) {
      user = DEFAULT_DEMO_USER;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        studentId: user.student_id,
        className: user.class_name,
        school: user.school,
        avatarUrl: user.avatar_url || '/avatar.JPG',
        links: {
          github: user.github_link,
          figma: user.figma_link,
          pdfReport: user.pdf_link,
        },
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin người dùng.',
      error: error.message,
    });
  }
}

// 3. Xử lý Đăng xuất (POST /api/auth/logout)
export async function logout(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công khỏi hệ thống IoT',
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng xuất.',
      error: error.message,
    });
  }
}

