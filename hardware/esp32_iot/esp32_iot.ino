#include <ArduinoJson.h>
#include <DHT.h>
#include <PubSubClient.h>
#include <WiFi.h>

#define DHTPIN 15
#define DHTTYPE DHT22

#define LDR_PIN 34
#define LED1_PIN 2
#define LED2_PIN 4
#define LED3_PIN 16
#define LED4_PIN 17

struct LedConfig {
  int deviceId;
  int gpio;
  const char *pinLabel;
  const char *shortLabel;
};

const LedConfig LED_CONFIGS[4] = {
    {1, LED1_PIN, "GPIO 2", "D2"},
    {2, LED2_PIN, "GPIO 4", "D4"},
    {3, LED3_PIN, "GPIO 16", "D16"},
    {4, LED4_PIN, "GPIO 17", "D17"},
};

DHT dht(DHTPIN, DHTTYPE);

const char *ssid = "Kazi";
const char *password = "1234567890";

const char *mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char *mqtt_user = "nguyentuantai";
const char *mqtt_pass = "b23dccn731";

const char *topic_sensor_data = "esp32/sensors/data";
const char *topic_control = "esp32/device/control";
const char *topic_device_status = "esp32/device/status";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 2000;
unsigned long packetCount = 0;

unsigned long lastMqttRetry = 0;
const unsigned long MQTT_RETRY_INTERVAL = 5000;

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

bool publishDeviceAck(int deviceId, const char *pinLabel, int statusOut,
                      int actualState, bool success, const char *reqId) {
  StaticJsonDocument<256> respDoc;
  respDoc["deviceId"] = deviceId;
  respDoc["pin"] = pinLabel;
  respDoc["status"] = statusOut;
  respDoc["actualState"] = actualState;
  respDoc["success"] = success;
  respDoc["requestId"] = reqId;
  respDoc["timestamp"] = millis();

  char respBuffer[256];
  serializeJson(respDoc, respBuffer);
  return mqttClient.publish(topic_device_status, respBuffer, true);
}

int findLedIndex(int deviceId, const char *pinStr) {
  for (int i = 0; i < 4; i++) {
    bool pinMatch = (strlen(pinStr) == 0) ||
                    (strcmp(pinStr, LED_CONFIGS[i].pinLabel) == 0) ||
                    (strcasecmp(pinStr, LED_CONFIGS[i].shortLabel) == 0);
    if (deviceId == LED_CONFIGS[i].deviceId && pinMatch) {
      return i;
    }
  }
  return -1;
}

void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("[MQTT Command] Topic: ");
  Serial.println(topic);
  Serial.print("[MQTT Command] Payload: ");
  Serial.println(message);

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("[MQTT Command Error] JSON parse failed: ");
    Serial.println(error.f_str());
    return;
  }

  int deviceId = doc["deviceId"] | -1;
  int statusVal = doc["status"] | 0;
  const char *pinStr = doc["pin"] | "";
  const char *actionStr = doc["action"] | "";
  const char *reqId = doc["requestId"] | "";

  bool isAllCommand = (deviceId == 0) || (strcasecmp(pinStr, "ALL") == 0) ||
                      (strcasecmp(actionStr, "ALL_ON") == 0) ||
                      (strcasecmp(actionStr, "ALL_OFF") == 0);

  if (isAllCommand) {
    int targetStatus = statusVal;
    if (strcasecmp(actionStr, "ALL_ON") == 0) {
      targetStatus = 1;
    } else if (strcasecmp(actionStr, "ALL_OFF") == 0) {
      targetStatus = 0;
    }

    int expected = (targetStatus == 1) ? HIGH : LOW;
    bool allSuccess = true;
    bool allHigh = true;
    bool allLow = true;

    for (int i = 0; i < 4; i++) {
      digitalWrite(LED_CONFIGS[i].gpio, expected);
    }
    Serial.printf("[Hardware] ALL 4 LEDs set to %s\n",
                  targetStatus == 1 ? "HIGH (ON)" : "LOW (OFF)");

    for (int i = 0; i < 4; i++) {
      int actual = digitalRead(LED_CONFIGS[i].gpio);
      bool ok = (actual == expected);
      allSuccess = allSuccess && ok;
      allHigh = allHigh && (actual == HIGH);
      allLow = allLow && (actual == LOW);
      publishDeviceAck(LED_CONFIGS[i].deviceId, LED_CONFIGS[i].pinLabel,
                       (actual == HIGH) ? 1 : 0, actual, ok, reqId);
    }

    int allStatusOut = allHigh ? 1 : (allLow ? 0 : -1);
    publishDeviceAck(0, "ALL", allStatusOut, allHigh ? 1 : 0, allSuccess, reqId);

    Serial.printf("[MQTT Status ACK] Published feedback for ALL LEDs to %s "
                  "(success: %s)\n",
                  topic_device_status, allSuccess ? "true" : "false");
    return;
  }

  int ledIdx = findLedIndex(deviceId, pinStr);
  if (ledIdx == -1) {
    Serial.printf("[Hardware Error] Mismatched deviceId (%d) and pin (%s), "
                  "or unsupported device! Command rejected.\n",
                  deviceId, pinStr);
    return;
  }

  const LedConfig &targetLed = LED_CONFIGS[ledIdx];
  int expectedState = (statusVal == 1) ? HIGH : LOW;
  digitalWrite(targetLed.gpio, expectedState);
  Serial.printf("[Hardware] LED %d (%s / %s) set to %s\n",
                targetLed.deviceId, targetLed.pinLabel, targetLed.shortLabel,
                statusVal == 1 ? "HIGH (ON)" : "LOW (OFF)");

  int actualPinState = digitalRead(targetLed.gpio);
  bool isSuccess = (actualPinState == expectedState);
  boolean sent = publishDeviceAck(
      targetLed.deviceId, targetLed.pinLabel,
      (actualPinState == HIGH) ? 1 : 0, actualPinState, isSuccess, reqId);
  if (sent) {
    Serial.printf("[MQTT Status ACK] Published feedback for LED %d (%s) to %s\n",
                  targetLed.deviceId, targetLed.pinLabel, topic_device_status);
  } else {
    Serial.println("[MQTT Status ACK Error] Failed to publish feedback!");
  }
}

void reconnectMQTT() {
  unsigned long now = millis();
  if (now - lastMqttRetry < MQTT_RETRY_INTERVAL) {
    return;
  }
  lastMqttRetry = now;

  Serial.print("[MQTT] Connecting to broker (non-blocking)...");

  String clientId = "ESP32_IoT_Client_" + String(random(0xffff), HEX);

  boolean connected = false;
  if (strlen(mqtt_user) > 0) {
    connected = mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_pass);
  } else {
    connected = mqttClient.connect(clientId.c_str());
  }

  if (connected) {
    Serial.println(" Connected.");
    mqttClient.subscribe(topic_control);
    Serial.print("[MQTT] Subscribed to: ");
    Serial.println(topic_control);
  } else {
    Serial.print(" Failed, rc=");
    Serial.print(mqttClient.state());
    Serial.println(". Will retry in 5 seconds without blocking.");
  }
}

float calculateLux(int rawADC) {
  if (rawADC <= 0)
    return 0.0;

  float vOut = ((float)rawADC / 4095.0) * 3.3;
  if (vOut < 0.005)
    return 0.0;
  if (vOut >= 3.295)
    vOut = 3.295;

  const float R_FIXED = 10000.0;
  float rLDR = R_FIXED * ((3.3 / vOut) - 1.0);
  if (rLDR < 50.0)
    rLDR = 50.0;

  float lux = pow((500.0 * 1000.0) / rLDR, 1.0 / 0.7);
  if (lux < 0.0)
    lux = 0.0;

  return round(lux);
}

void publishSensorReadings() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int rawLDR = analogRead(LDR_PIN);
  float lightLux = calculateLux(rawLDR);

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("[Sensor Warning] Failed to read from DHT22 sensor!");
    return;
  }

  if (!mqttClient.connected()) {
    Serial.println("[MQTT Warning] MQTT not connected, skipping publish.");
    return;
  }

  int gasPpm = random(200, 801);
  packetCount++;

  StaticJsonDocument<256> doc;
  doc["temperature"] = round(temperature * 10.0) / 10.0;
  doc["humidity"] = round(humidity * 10.0) / 10.0;
  doc["light"] = round(lightLux);
  doc["gas"] = gasPpm;
  doc["packet_no"] = packetCount;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  boolean success = mqttClient.publish(topic_sensor_data, jsonBuffer);

  if (success) {
    Serial.printf("[MQTT Publish #%lu] T: %.1f C | H: %.1f %% | L: %.0f Lux | G: %d ppm "
                  "(raw ADC: %d)\n",
                  packetCount, temperature, humidity, lightLux, gasPpm, rawLDR);
  } else {
    Serial.println("[MQTT Error] Publish failed!");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  randomSeed(esp_random());

  Serial.println("\n[System] ESP32 IoT Node starting up...");
  Serial.println("[System] Student: Nguyen Tuan Tai (B23DCCN731)");

  for (int i = 0; i < 4; i++) {
    pinMode(LED_CONFIGS[i].gpio, OUTPUT);
    digitalWrite(LED_CONFIGS[i].gpio, LOW);
  }
  pinMode(LDR_PIN, INPUT);

  dht.begin();

  connectToWiFi();

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  if (!mqttClient.connected()) {
    reconnectMQTT();
  } else {
    mqttClient.loop();
  }

  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    publishSensorReadings();
  }
}
