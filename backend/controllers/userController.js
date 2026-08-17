import { pool } from '../config/db.js';

/**
 * User / Profile Controller
 * Quản lý thông tin sinh viên và 3 link tài nguyên dự án
 */

// 1. Lấy thông tin Profile
export async function getProfile(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM `users` WHERE `id` = 1 LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin sinh viên' });
    }
    const user = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        studentId: user.student_id,
        className: user.class_name,
        school: user.school,
        avatarUrl: user.avatar_url,
        projectName: 'Hệ Thống Giám Sát Môi Trường & Điều Khiển Thiết Bị IoT (ESP32)',
        description: 'Đo nhiệt độ, độ ẩm, ánh sáng và điều khiển 2 đèn LED qua MQTT.',
        links: {
          github: user.github_link || 'https://github.com/your-username/iot-esp32-project',
          figma: user.figma_link || 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1',
          pdfReport: user.pdf_link || 'https://drive.google.com/file/d/sample-iot-report-pdf/view',
        },
      },
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy profile', error: error.message });
  }
}

// 2. Cập nhật Profile
export async function updateProfile(req, res) {
  try {
    const { fullName, studentId, className, school, links } = req.body;

    await pool.query(
      `UPDATE \`users\` SET 
        \`full_name\` = ?,
        \`student_id\` = ?,
        \`class_name\` = ?,
        \`school\` = ?,
        \`github_link\` = ?,
        \`figma_link\` = ?,
        \`pdf_link\` = ?
      WHERE \`id\` = 1`,
      [
        fullName,
        studentId,
        className,
        school,
        links?.github || null,
        links?.figma || null,
        links?.pdfReport || null,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin sinh viên thành công',
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật profile', error: error.message });
  }
}
