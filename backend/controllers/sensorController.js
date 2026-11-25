import { pool } from '../config/db.js';

/**
 * Sensor Controller
 * Xử lý các nghiệp vụ liên quan đến Cảm biến và Dữ liệu đo đạc (Data Sensors)
 */

// 1. Lấy danh sách cảm biến và giá trị đo mới nhất
export async function getSensors(req, res) {
  try {
    const [sensors] = await pool.query('SELECT * FROM `sensors` ORDER BY `id` ASC');

    // Lấy giá trị mới nhất của từng cảm biến
    const enrichedSensors = await Promise.all(
      sensors.map(async (sensor) => {
        const [latestRows] = await pool.query(
          'SELECT `value`, `measured_at` FROM `data_sensors` WHERE `sensor_id` = ? ORDER BY `measured_at` DESC LIMIT 1',
          [sensor.id]
        );
        const latestVal = latestRows.length > 0 ? latestRows[0].value : 0;
        const measuredAt = latestRows.length > 0 ? latestRows[0].measured_at : null;

        return {
          id: sensor.id,
          name: sensor.sensor_name,
          code: sensor.code,
          unit: sensor.unit,
          currentValue: latestVal,
          measuredAt: measuredAt,
        };
      })
    );

    return res.status(200).json({ success: true, data: enrichedSensors });
  } catch (error) {
    console.error('Error in getSensors:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy cảm biến', error: error.message });
  }
}

// 2. Lấy dữ liệu Data Sensors (kèm Lọc loại, Tìm kiếm thời gian cắt dần, Sắp xếp theo giá trị hoặc DESC thời gian và Phân trang)
export async function getDataSensors(req, res) {
  try {
    const { type, time, sortBy, order, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClauses = [];
    let queryParams = [];

    // Lọc theo loại cảm biến (Nhiệt độ, Độ ẩm, Ánh sáng)
    if (type && type !== 'all') {
      whereClauses.push('s.code = ?');
      queryParams.push(type);
    }

    // Tìm kiếm linh hoạt theo thời gian cắt dần (Prefix Search với LIKE)
    if (time && time.trim()) {
      whereClauses.push("DATE_FORMAT(d.measured_at, '%Y-%m-%d %H:%i:%s') LIKE ?");
      queryParams.push(`${time.trim()}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Đếm tổng số bản ghi thỏa mãn điều kiện
    const countSql = `
      SELECT COUNT(*) AS total 
      FROM \`data_sensors\` d
      JOIN \`sensors\` s ON d.sensor_id = s.id
      ${whereSql}
    `;
    const [countResult] = await pool.query(countSql, queryParams);
    const totalItems = countResult[0].total;

    // 2. Lấy danh sách bản ghi theo trang (Sắp xếp theo sortBy hoặc mặc định DESC theo thời gian đo)
    let orderClause = 'ORDER BY d.measured_at DESC, d.id DESC';
    if (sortBy === 'value') {
      const dir = (order && order.toLowerCase() === 'asc') ? 'ASC' : 'DESC';
      orderClause = `ORDER BY d.value ${dir}, d.measured_at DESC, d.id DESC`;
    }

    const selectSql = `
      SELECT 
        d.id,
        d.sensor_id AS sensorId,
        s.sensor_name AS sensorName,
        s.code AS type,
        d.value,
        s.unit,
        DATE_FORMAT(d.measured_at, '%Y-%m-%d %H:%i:%s') AS timestamp
      FROM \`data_sensors\` d
      JOIN \`sensors\` s ON d.sensor_id = s.id
      ${whereSql}
      ${orderClause}
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
    console.error('Error in getDataSensors:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy dữ liệu cảm biến', error: error.message });
  }
}
