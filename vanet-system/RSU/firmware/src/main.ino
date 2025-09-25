// RSU Firmware (ESP32) - LoRa RX + SIM800L GPRS HTTP uplink
// NOTE: This is a reference implementation for engineering and must be adapted for production.

#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <HardwareSerial.h>
#include "config.h"

// Use Serial for logs

HardwareSerial SIMSerial(2); // UART2

void sim800_init() {
  SIMSerial.begin(115200, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  pinMode(SIM_PWKEY_PIN, OUTPUT);
  digitalWrite(SIM_PWKEY_PIN, LOW);
  delay(100);
  // Power on sequence if needed (toggle PWRKEY)
}

bool sim800_send_command(const char* cmd, const char* expect, unsigned long timeout=2000) {
  while (SIMSerial.available()) SIMSerial.read();
  SIMSerial.print(cmd);
  SIMSerial.print("\r\n");
  unsigned long start=millis();
  String resp="";
  while (millis()-start < timeout) {
    while (SIMSerial.available()) { resp += (char)SIMSerial.read(); }
    if (resp.indexOf(expect) >= 0) { return true; }
  }
  return false;
}

bool sim800_http_post(const String &url, const String &payload) {
  // Sequence: AT+SAPBR / AT+HTTPINIT / AT+HTTPPARA / AT+HTTPDATA / AT+HTTPACTION
  if (!sim800_send_command("AT", "OK", 1000)) return false;
  if (!sim800_send_command("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", "OK", 2000)) return false;
  String apnCmd = String("AT+SAPBR=3,1,\"APN\",\"") + SIM_APN + "\"";
  if (!sim800_send_command(apnCmd.c_str(), "OK", 2000)) return false;
  if (!sim800_send_command("AT+SAPBR=1,1", "OK", 10000)) return false;
  if (!sim800_send_command("AT+HTTPINIT", "OK", 2000)) return false;
  String para = String("AT+HTTPPARA=\"URL\",\"") + url + "\"";
  if (!sim800_send_command(para.c_str(), "OK", 2000)) return false;
  String dataCmd = String("AT+HTTPDATA=") + payload.length() + ",10000";
  if (!sim800_send_command(dataCmd.c_str(), "DOWNLOAD", 2000)) return false;
  // send payload
  SIMSerial.print(payload);
  delay(100);
  if (!sim800_send_command("AT+HTTPACTION=1", "+HTTPACTION", 15000)) return false;
  // Read response code optionally
  sim800_send_command("AT+HTTPTERM", "OK", 2000);
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("RSU (Cellular) starting...");
  // LoRa init
  SPI.begin();
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed");
    while(1) delay(1000);
  }
  Serial.println("LoRa ready");

  // SIM800L init
  sim800_init();
  delay(1000);
  sim800_send_command("AT", "OK", 1000);
  // Attach GPRS
  sim800_send_command("AT+CREG=1", "OK", 1000);
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String s="";
    while (LoRa.available()) s += (char)LoRa.read();
    Serial.println("RX: " + s);
    // Build JSON payload to send to CMS
    String payload = s; // assume OBU already sends JSON; else reformat
    // Try sending via SIM800L
    bool ok = sim800_http_post(CMS_URL, payload);
    if (ok) Serial.println("HTTP POST ok"); else Serial.println("HTTP POST failed");
  }
  delay(100);
}
