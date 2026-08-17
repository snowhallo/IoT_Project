-- ==============================================================================
-- SEED DATA: DỮ LIỆU MẪU KIỂM THỬ HỆ THỐNG IOT
-- ==============================================================================

USE `iot_project_db`;

-- 1. Nạp dữ liệu Bảng Users
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `student_id`, `class_name`, `school`, `avatar_url`, `github_link`, `figma_link`, `pdf_link`)
VALUES (
  1,
  'student_admin',
  '123456',
  'Nguyễn Tuấn Tài',
  'B23DCCN731',
  'D23CQCN03-B',
  'Học viện Công nghệ Bưu chính Viễn thông',
  NULL,
  'https://github.com/your-username/iot-esp32-project',
  'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1',
  'https://drive.google.com/file/d/sample-iot-report-pdf/view'
);

-- 2. Nạp dữ liệu Bảng Sensors
INSERT INTO `sensors` (`id`, `sensor_name`, `code`, `unit`, `pin_gpio`) VALUES
(1, 'Nhiệt độ', 'temperature', '°C', 'GPIO 15'),
(2, 'Độ ẩm', 'humidity', '%', 'GPIO 15'),
(3, 'Ánh sáng', 'light', 'Lux', 'ADC 34');

-- 3. Nạp dữ liệu Bảng Devices (2 Đèn LED chuẩn)
INSERT INTO `devices` (`id`, `device_name`, `type`, `pin_gpio`, `status`, `description`) VALUES
(1, 'Đèn LED 1', 'led', 'GPIO 2', 1, 'Đèn chiếu sáng chính (LED 5mm)'),
(2, 'Đèn LED 2', 'led', 'GPIO 4', 0, 'Đèn cảnh báo / Chiếu sáng phụ (LED 5mm)');

-- 4. Nạp dữ liệu mẫu Bảng Data Sensors (Đo đạc nhiệt độ, độ ẩm, ánh sáng)
INSERT INTO `data_sensors` (`sensor_id`, `value`, `measured_at`) VALUES
(1, 28.5, '2026-08-15 14:32:00'),
(2, 68.2, '2026-08-15 14:32:00'),
(3, 485.0, '2026-08-15 14:32:00'),
(1, 28.8, '2026-08-15 14:31:45'),
(2, 67.5, '2026-08-15 14:31:45'),
(3, 490.0, '2026-08-15 14:31:45'),
(1, 29.2, '2026-08-15 14:31:30'),
(2, 68.0, '2026-08-15 14:31:30'),
(3, 505.0, '2026-08-15 14:31:30'),
(1, 29.5, '2026-08-15 14:31:15'),
(2, 69.1, '2026-08-15 14:31:15'),
(3, 520.0, '2026-08-15 14:31:15'),
(1, 29.8, '2026-08-15 14:31:00'),
(2, 68.7, '2026-08-15 14:31:00'),
(3, 545.0, '2026-08-15 14:31:00'),
(1, 30.1, '2026-08-15 14:30:45'),
(2, 68.2, '2026-08-15 14:30:45'),
(3, 530.0, '2026-08-15 14:30:45'),
(1, 29.4, '2026-08-15 14:30:30'),
(2, 67.8, '2026-08-15 14:30:30'),
(3, 510.0, '2026-08-15 14:30:30'),
(1, 29.0, '2026-08-15 14:30:15'),
(2, 67.5, '2026-08-15 14:30:15'),
(3, 490.0, '2026-08-15 14:30:15'),
(1, 28.7, '2026-08-15 14:30:00'),
(2, 66.8, '2026-08-15 14:30:00'),
(3, 470.0, '2026-08-15 14:30:00'),
(1, 28.2, '2026-08-15 14:28:00'),
(2, 65.4, '2026-08-15 14:28:00'),
(3, 440.0, '2026-08-15 14:28:00');

-- 5. Nạp dữ liệu mẫu Bảng History (Lịch sử điều khiển thiết bị: Action và Status chuẩn BẬT / TẮT)
INSERT INTO `history` (`device_id`, `user_id`, `action`, `status`, `created_at`) VALUES
(1, 1, 'BẬT', 'BẬT', '2026-08-15 14:31:45'),
(2, 1, 'TẮT', 'TẮT', '2026-08-15 14:30:12'),
(1, 1, 'TẮT', 'TẮT', '2026-08-15 14:28:05'),
(2, 1, 'BẬT', 'BẬT', '2026-08-15 14:25:30'),
(2, 1, 'BẬT', 'BẬT', '2026-08-15 14:20:10'),
(2, 1, 'TẮT', 'TẮT', '2026-08-15 14:15:00'),
(1, 1, 'BẬT', 'BẬT', '2026-08-15 13:55:22'),
(2, 1, 'TẮT', 'TẮT', '2026-08-15 13:40:15'),
(1, 1, 'TẮT', 'TẮT', '2026-08-15 12:10:04'),
(2, 1, 'BẬT', 'BẬT', '2026-08-15 11:30:50');
