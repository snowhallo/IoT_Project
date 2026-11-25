import { pool } from '../config/db.js';

/**
 * History Controller
 * Xử lý tra cứu lịch sử điều khiển thiết bị (Bắt buộc chuẩn 5 cột dữ liệu)
 */
export async function getHistory(req, res) {
  try {
    const { device, time, search, action, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClauses = [];
    let queryParams = [];

    // 1. Lọc theo Thiết bị (Device ID hoặc Device Name)
    if (device && device !== 'all') {
      if (!isNaN(Number(device))) {
        whereClauses.push('h.device_id = ?');
        queryParams.push(Number(device));
      } else {
        whereClauses.push('d.device_name = ?');
        queryParams.push(device);
      }
    }

    // 2. Tìm kiếm theo Mốc thời gian cắt dần (Prefix Time Search)
    const timeQuery = time || search;
    if (timeQuery && timeQuery.trim()) {
      whereClauses.push("DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') LIKE ?");
      queryParams.push(`${timeQuery.trim()}%`);
    }

    // 3. Lọc theo Hành động gửi đi (Action: BẬT, TẮT)
    if (action && action !== 'all') {
      whereClauses.push('h.action = ?');
      queryParams.push(action);
    }

    // 4. Lọc theo Trạng thái phản hồi (Status: BẬT, TẮT, TIMEOUT)
    if (status && status !== 'all') {
      whereClauses.push('h.status = ?');
      queryParams.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const countSql = `
      SELECT COUNT(*) AS total 
      FROM \`history\` h
      JOIN \`devices\` d ON h.device_id = d.id
      ${whereSql}
    `;
    const [countResult] = await pool.query(countSql, queryParams);
    const totalItems = countResult[0].total;

    // Lấy danh sách lịch sử 5 cột bắt buộc (Sắp xếp DESC theo thời gian)
    const selectSql = `
      SELECT 
        h.id,
        d.device_name AS deviceName,
        h.action,
        h.status,
        DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') AS timestamp
      FROM \`history\` h
      JOIN \`devices\` d ON h.device_id = d.id
      ${whereSql}
      ORDER BY h.created_at DESC, h.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(selectSql, [...queryParams, Number(limit), Number(offset)]);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        currentPage: Number(page),
        pageSize: Number(limit),
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy lịch sử', error: error.message });
  }
}
