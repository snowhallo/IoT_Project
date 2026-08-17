-- ==============================================================================
-- DATABASE SCHEMA: HỆ THỐNG GIÁM SÁT MÔI TRƯỜNG & ĐIỀU KHIỂN THIẾT BỊ IOT
-- Tuân thủ chính xác 5 bảng dữ liệu bắt buộc theo REQUIREMENTS.MD
-- ==============================================================================

-- 1. Tạo cơ sở dữ liệu (nếu chưa có)
CREATE DATABASE IF NOT EXISTS `iot_project_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `iot_project_db`;

-- Xóa các bảng cũ theo thứ tự ràng buộc khóa ngoại (nếu cần reset)
DROP TABLE IF EXISTS `history`;
DROP TABLE IF EXISTS `data_sensors`;
DROP TABLE IF EXISTS `devices`;
DROP TABLE IF EXISTS `sensors`;
DROP TABLE IF EXISTS `users`;

-- ==============================================================================
-- 1. BẢNG USERS: Quản lý thông tin định danh sinh viên / người dùng
-- ==============================================================================
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `student_id` VARCHAR(20) NOT NULL,
  `class_name` VARCHAR(50) NOT NULL,
  `school` VARCHAR(150) DEFAULT 'Học viện Công nghệ Bưu chính Viễn thông',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `github_link` VARCHAR(255) DEFAULT NULL,
  `figma_link` VARCHAR(255) DEFAULT NULL,
  `pdf_link` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- 2. BẢNG SENSORS: Cấu hình và định nghĩa danh mục cảm biến trong hệ thống
-- ==============================================================================
CREATE TABLE `sensors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sensor_name` VARCHAR(50) NOT NULL,         -- Ví dụ: Nhiệt độ, Độ ẩm, Ánh sáng
  `code` VARCHAR(30) NOT NULL UNIQUE,         -- temperature, humidity, light
  `unit` VARCHAR(20) NOT NULL,                -- °C, %, Lux
  `pin_gpio` VARCHAR(20) DEFAULT NULL,        -- GPIO 15, ADC 34
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- 3. BẢNG DEVICES: Quản lý danh sách thiết bị phần cứng có thể điều khiển
-- ==============================================================================
CREATE TABLE `devices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_name` VARCHAR(50) NOT NULL,         -- Ví dụ: Đèn LED 1, Quạt làm mát, Đèn LED 2
  `type` VARCHAR(30) NOT NULL,                -- led, fan, relay
  `pin_gpio` VARCHAR(20) NOT NULL,            -- GPIO 2, GPIO 4, GPIO 5
  `status` TINYINT(1) NOT NULL DEFAULT 0,     -- 0: TẮT (OFF), 1: BẬT (ON)
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- 4. BẢNG DATA_SENSORS: Lưu log dữ liệu đo đạc từ cảm biến theo thời gian
-- Ràng buộc Khóa ngoại (FK): sensor_id -> sensors(id)
-- ==============================================================================
CREATE TABLE `data_sensors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sensor_id` INT NOT NULL,
  `value` FLOAT NOT NULL,
  `measured_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sensor_id` (`sensor_id`),
  INDEX `idx_measured_at` (`measured_at`),
  CONSTRAINT `fk_data_sensor_sensor`
    FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================================================
-- 5. BẢNG HISTORY: Lưu lịch sử thao tác điều khiển thiết bị của người dùng
-- Ràng buộc Khóa ngoại (FK):
--   - device_id -> devices(id)
--   - user_id   -> users(id)
-- ==============================================================================
CREATE TABLE `history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `action` VARCHAR(20) NOT NULL,              -- BẬT hoặc TẮT
  `status` VARCHAR(100) NOT NULL,             -- Trạng thái phản hồi từ HW: Thành công (ON), Thành công (OFF)
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_device_id` (`device_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_history_device`
    FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_history_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
