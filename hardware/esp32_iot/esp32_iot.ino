#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ==========================================
// 1. CẤU HÌNH PHẦN CỨNG & CHÂN GPIO
// ==========================================
#define DHTPIN 15          // Chân Data của cảm biến DHT22
#define DHTTYPE DHT22      // Loại cảm biến: DHT22 (hoặc DHT11 nếu dùng kit cũ)

#define LDR_PIN 34         // Chân đọc tín hiệu Analog từ Quang trở LDR (ADC1)
#define LED1_PIN 2         // Đèn LED 1 (Chiếu sáng chính)
#define LED2_PIN 4         // Đèn LED 2 (Đèn cảnh báo / Chiếu sáng phụ)

// Khởi tạo đối tượng cảm biến DHT
DHT dht(DHTPIN, DHTTYPE);

// ==========================================
// 2. CẤU HÌNH MẠNG WIFI & MQTT BROKER
// ==========================================
// Tên và Mật khẩu WiFi (Mặc định cấu hình tương thích cả mạng thật & Wokwi-GUEST)
const char* ssid        = "Wokwi-GUEST"; // Thay bằng tên WiFi nhà bạn khi nạp mạch thật
const char* password    = "";            // Mật khẩu WiFi

// Thông tin máy chủ MQTT Broker (Public HiveMQ Broker - Port 1883)
const char* mqtt_server = "broker.hivemq.com";
const int   mqtt_port   = 1883;

// Topics giao tiếp chuẩn khớp 100% với file REQUIREMENTS.md và Backend
const char* topic_sensor_data = "esp32/sensors/data";
const char* topic_control     = "esp32/device/control";

// Khởi tạo Client mạng WiFi và Client MQTT
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Biến đếm số lượng gói tin đã gửi và Timer không chặn (Non-blocking timer)
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000; // Gửi dữ liệu định kỳ mỗi 3 giây (3000ms)
unsigned long packetCount = 0;

// ==========================================
// 3. HÀM KẾT NỐI MẠNG WIFI
// ==========================================
void connectToWiFi() {
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED && retryCount < 20) {
    delay(500);
    Serial.print(".");
    retryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully.");
    Serial.print("[WiFi] IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection pending, will retry in loop...");
  }
}

// ==========================================
// 4. HÀM XỬ LÝ NHẬN LỆNH TỪ MQTT (CALLBACK)
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("[MQTT Command] Topic: ");
  Serial.println(topic);
  Serial.print("[MQTT Command] Payload: ");
  Serial.println(message);

  // Xử lý gói tin JSON từ Backend Node.js
  // Format: {"deviceId":1,"action":"BẬT","status":1,"pin":"GPIO 2"}
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    int deviceId   = doc["deviceId"] | 0;
    int statusVal  = doc["status"] | 0; // 1 = BẬT, 0 = TẮT
    const char* pinStr = doc["pin"] | "";

    if (deviceId == 1 || strcmp(pinStr, "GPIO 2") == 0) {
      digitalWrite(LED1_PIN, statusVal == 1 ? HIGH : LOW);
      Serial.printf("[Hardware] LED 1 (GPIO 2) set to %s\n", statusVal == 1 ? "HIGH (ON)" : "LOW (OFF)");
    } 
    else if (deviceId == 2 || strcmp(pinStr, "GPIO 4") == 0) {
      digitalWrite(LED2_PIN, statusVal == 1 ? HIGH : LOW);
      Serial.printf("[Hardware] LED 2 (GPIO 4) set to %s\n", statusVal == 1 ? "HIGH (ON)" : "LOW (OFF)");
    }
  } else {
    Serial.print("[MQTT Command Error] JSON parse failed: ");
    Serial.println(error.f_str());
  }
}

// ==========================================
// 5. HÀM DUY TRÌ & KẾT NỐI TỚI MQTT BROKER
// ==========================================
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Connecting to broker...");
    
    // Tạo Client ID ngẫu nhiên để tránh xung đột kết nối trên Public Broker
    String clientId = "ESP32_IoT_Client_" + String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str())) {
      Serial.println(" Connected.");
      mqttClient.subscribe(topic_control);
      Serial.print("[MQTT] Subscribed to: ");
      Serial.println(topic_control);
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(". Retrying in 2 seconds...");
      delay(2000);
    }
  }
}

// ==========================================
// 6. HÀM ĐỌC CẢM BIẾN & PUBLISH DỮ LIỆU JSON
// ==========================================
void publishSensorReadings() {
  // 1. Đọc Nhiệt độ (°C) và Độ ẩm (%) từ DHT22
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // 2. Đọc giá trị Analog từ Quang trở LDR (Thang đo ADC ESP32 là 0 - 4095)
  int rawLDR = analogRead(LDR_PIN);
  
  // Quy đổi giá trị ADC (0 - 4095) sang đơn vị Lux chuẩn đồ án (0 - 1000 Lux)
  float lightLux = map(rawLDR, 0, 4095, 0, 1000);

  // Kiểm tra nếu cảm biến DHT bị lỗi đọc
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("[Sensor Warning] Failed to read from DHT22 sensor!");
    return;
  }

  packetCount++;

  // 3. Đóng gói dữ liệu sang định dạng JSON chuẩn
  StaticJsonDocument<256> doc;
  doc["temperature"] = round(temperature * 10.0) / 10.0;
  doc["humidity"]    = round(humidity * 10.0) / 10.0;
  doc["light"]       = round(lightLux);
  doc["packet_no"]   = packetCount;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  // 4. Gửi gói tin lên MQTT Broker
  boolean success = mqttClient.publish(topic_sensor_data, jsonBuffer);

  if (success) {
    Serial.printf("[MQTT Publish #%lu] T: %.1f C | H: %.1f %% | L: %.0f Lux\n", 
                  packetCount, temperature, humidity, lightLux);
  } else {
    Serial.println("[MQTT Error] Publish failed!");
  }
}

// ==========================================
// 7. HÀM SETUP (CHẠY 1 LẦN KHI KHỞI ĐỘNG)
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n[System] ESP32 IoT Node starting up...");
  Serial.println("[System] Student: Nguyen Tuan Tai (B23DCCN731)");

  // Thiết lập chế độ cho các chân GPIO
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LDR_PIN, INPUT);

  // Khởi tạo trạng thái ban đầu cho 2 đèn LED (Mặc định TẮT)
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);

  // Khởi động cảm biến DHT22
  dht.begin();

  // Kết nối WiFi
  connectToWiFi();

  // Cấu hình máy chủ MQTT và hàm xử lý callback
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
}

// ==========================================
// 8. HÀM LOOP (VÒNG LẶP CHÍNH CỦA CHƯƠNG TRÌNH)
// ==========================================
void loop() {
  // 1. Luôn kiểm tra kết nối WiFi
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // 2. Luôn kiểm tra kết nối MQTT Broker
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop(); // Duy trì lắng nghe gói tin MQTT đến

  // 3. Sử dụng Non-blocking Timer để gửi dữ liệu định kỳ mỗi 3 giây
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    publishSensorReadings();
  }
}
