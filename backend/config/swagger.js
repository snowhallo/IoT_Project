import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'IoT ESP32 Smart Monitoring & Device Control API',
    version: '1.0.0',
    description: `
Tài liệu REST API cho Hệ thống Giám sát Môi trường & Điều khiển Thiết bị IoT (ESP32 & MQTT).

### Danh mục chức năng:
- Sensors: Cấu hình và dữ liệu tức thời (Nhiệt độ, Độ ẩm, Ánh sáng).
- Data Sensors: Log dữ liệu đo đạc, lọc loại, tìm kiếm thời gian linh hoạt (Prefix match) và phân trang.
- Devices: Điều khiển thiết bị 2 chiều (Frontend -> Backend -> MQTT -> ESP32).
- History: Lịch sử thao tác điều khiển thiết bị chuẩn 5 cột dữ liệu.
- Profile: Thông tin sinh viên và 3 liên kết tài nguyên (GitHub, Figma, Báo cáo PDF).
    `,
    contact: {
      name: 'Nguyễn Tuấn Tài',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Xác thực tài khoản và cấp phát JWT Token',
    },
    {
      name: 'Sensors',
      description: 'Quản lý thông tin cảm biến và giá trị đo tức thời',
    },
    {
      name: 'Data Sensors',
      description: 'Tra cứu lịch sử dữ liệu đo đạc, lọc loại, tìm kiếm thời gian và phân trang',
    },
    {
      name: 'Devices',
      description: 'Quản lý và gửi lệnh điều khiển BẬT/TẮT thiết bị phần cứng qua MQTT',
    },
    {
      name: 'History',
      description: 'Truy vấn lịch sử điều khiển thiết bị chuẩn 5 cột',
    },
    {
      name: 'Profile',
      description: 'Quản lý thông tin cá nhân sinh viên và 3 liên kết tài nguyên dự án',
    },
    {
      name: 'System',
      description: 'Kiểm tra trạng thái hoạt động của hệ thống (Health Check)',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    schemas: {
      Sensor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Nhiệt độ' },
          code: { type: 'string', example: 'temperature' },
          unit: { type: 'string', example: '°C' },
          currentValue: { type: 'number', example: 28.5 },
          measuredAt: { type: 'string', format: 'date-time', example: '2026-08-16 15:30:00' },
        },
      },
      DataSensor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 105 },
          sensorId: { type: 'integer', example: 1 },
          sensorName: { type: 'string', example: 'Nhiệt độ' },
          type: { type: 'string', example: 'temperature' },
          value: { type: 'number', example: 29.2 },
          unit: { type: 'string', example: '°C' },
          timestamp: { type: 'string', example: '2026-08-16 15:25:30' },
        },
      },
      Device: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Đèn LED 1' },
          type: { type: 'string', example: 'led' },
          pin: { type: 'string', example: 'GPIO 2' },
          status: { type: 'boolean', example: true },
          description: { type: 'string', example: 'Đèn chiếu sáng chính (LED 5mm)' },
        },
      },
      HistoryItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          deviceName: { type: 'string', example: 'Đèn LED 1' },
          action: { type: 'string', enum: ['BẬT', 'TẮT'], example: 'BẬT' },
          status: { type: 'string', enum: ['BẬT', 'TẮT'], example: 'BẬT' },
          timestamp: { type: 'string', example: '2026-08-16 15:20:00' },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'student_admin' },
          fullName: { type: 'string', example: 'Nguyễn Tuấn Tài' },
          studentId: { type: 'string', example: 'B23DCCN731' },
          className: { type: 'string', example: 'D23CQCN03-B' },
          school: { type: 'string', example: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)' },
          avatarUrl: { type: 'string', nullable: true, example: null },
          projectName: { type: 'string', example: 'Hệ Thống Giám Sát Môi Trường & Điều Khiển Thiết Bị IoT (ESP32)' },
          description: { type: 'string', example: 'Đo nhiệt độ, độ ẩm, ánh sáng và điều khiển 2 đèn LED qua MQTT.' },
          links: {
            type: 'object',
            properties: {
              github: { type: 'string', example: 'https://github.com/your-username/iot-esp32-project' },
              figma: { type: 'string', example: 'https://www.figma.com/design/iA8pnBFROtTySO9LWuCat2/IoT_Project?node-id=0-1&t=3yXPG0hfRfMj34xh-1' },
              pdfReport: { type: 'string', example: 'https://drive.google.com/file/d/sample-iot-report-pdf/view' },
            },
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          currentPage: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 10 },
          totalItems: { type: 'integer', example: 120 },
          totalPages: { type: 'integer', example: 12 },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Thao tác thành công' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Mô tả thông báo lỗi' },
          error: { type: 'string', example: 'Chi tiết lỗi hệ thống' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT Token nhận được từ API /api/auth/login',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './app.js', './config/swagger.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
