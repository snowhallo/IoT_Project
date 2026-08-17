import dayjs from 'dayjs';

/**
 * Tiện ích hỗ trợ tìm kiếm linh hoạt theo thời gian (Flexible Time Search)
 * Hoạt động theo cơ chế cắt dần đơn vị thời gian (Prefix Matching):
 * - Nhập đầy đủ "YYYY-MM-DD HH:mm:ss" -> khớp chính xác từng giây
 * - Nhập "YYYY-MM-DD HH:mm" -> khớp toàn bộ bản ghi trong phút đó
 * - Nhập "YYYY-MM-DD HH" -> khớp toàn bộ bản ghi trong giờ đó
 * - Nhập "YYYY-MM-DD" -> khớp toàn bộ bản ghi trong ngày đó
 * - Nhập "YYYY-MM" -> khớp toàn bộ bản ghi trong tháng đó
 */
export function matchFlexibleTime(recordTimestamp, searchInput) {
  if (!searchInput || !searchInput.trim()) return true;
  if (!recordTimestamp) return false;

  const cleanInput = searchInput.trim();
  const cleanRecord = recordTimestamp.trim();

  return cleanRecord.startsWith(cleanInput);
}

/**
 * Định dạng ngày giờ chuẩn YYYY-MM-DD HH:mm:ss bằng Day.js
 */
export function formatDateTime(date = new Date()) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Lấy nhãn thời gian ngắn cho trục hoành biểu đồ HH:mm:ss bằng Day.js
 */
export function formatTimeOnly(date = new Date()) {
  return dayjs(date).format('HH:mm:ss');
}
