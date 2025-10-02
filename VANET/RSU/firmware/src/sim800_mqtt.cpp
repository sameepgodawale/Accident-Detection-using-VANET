#include "sim800_mqtt.h"
#include <HardwareSerial.h>

HardwareSerial SIM800(1);
static bool mqttReady = false;

static bool at_expect(const String &cmd, const char *expect, unsigned long timeout=3000) {
  while (SIM800.available()) SIM800.read();
  SIM800.print(cmd + "\r\n");
  unsigned long start = millis();
  String resp="";
  while (millis() - start < timeout) {
    while (SIM800.available()) resp += (char)SIM800.read();
    if (expect && resp.indexOf(expect) >= 0) return true;
    delay(10);
  }
  Serial.println("[SIM800] AT timeout for: " + cmd);
  return false;
}

void sim800_mqtt_init(const char *apn, const char *broker, int port, const char *client_id, const char *user, const char *pass) {
  SIM800.begin(9600, SERIAL_8N1, SIM800_RX_PIN, SIM800_TX_PIN);
  delay(500);
  at_expect("AT", "OK", 1000);
  at_expect("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", "OK", 2000);
  at_expect(String("AT+SAPBR=3,1,\"APN\",\"") + apn + "\"", "OK", 2000);
  at_expect("AT+SAPBR=1,1", "OK", 10000);
  at_expect("AT+CMQTTSTART", "OK", 5000);
  at_expect(String("AT+CMQTTACCQ=0,\"") + client_id + "\"", "OK", 3000);
  String conn = String("AT+CMQTTCONNECT=0,\"tcp://") + broker + ":" + String(port) + "\"";
  at_expect(conn, "OK", 8000);
  mqttReady = true;
}

bool sim800_mqtt_publish(const char *topic, const String &payload) {
  if (!mqttReady) return false;
  String pubCmd = String("AT+CMQTTPUB=0,\"") + topic + "\"," + String(payload.length()) + ",1";
  if (!at_expect(pubCmd, ">", 4000)) return false;
  SIM800.print(payload);
  SIM800.write(0x1A);
  return true;
}

void sim800_send_sms_alert(const String &msg) {
  at_expect("AT+CMGF=1", "OK", 2000);
  SIM800.print(String("AT+CMGS=\"+1234567890\"\r\n"));
  delay(500);
  SIM800.print(msg);
  SIM800.write(0x1A);
}