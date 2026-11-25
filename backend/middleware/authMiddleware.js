import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ptit_iot_secret_key_2026_b23dccn731';

/**
 * Middleware xác thực JWT Token (Chặn quyền truy cập trái phép)
 * Kiểm tra Header `Authorization: Bearer <token>`
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy Token xác thực. Vui lòng đăng nhập để tiếp tục.',
    });
  }

  // Token phải có dạng: "Bearer <token_string>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Định dạng Token không hợp lệ (Phải có dạng Bearer <token>).',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã bị chỉnh sửa.',
    });
  }
}
