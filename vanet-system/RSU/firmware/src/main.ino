// RSU ESP32 firmware (Arduino-style) - simplified reference
#include <SPI.h>
#include <LoRa.h>
#include <WiFi.h>
#include <WiFiUdp.h>

const char* ssid = ""; // optional
const char* pass = "";

WiFiUDP udp;
const char* udpHost = "127.0.0.1"; // for local testing (SBC loopback)
const int udpPort = 17000;

void setup() {
  Serial.begin(115200);
  // init LoRa (adjust pins to your board)
  LoRa.setPins(5, 14, 2); // NSS, reset, DIO0 placeholders
  if (!LoRa.begin(433E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }
  Serial.println("LoRa init ok");
  WiFi.mode(WIFI_STA);
  // don't block on WiFi - optional
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String s = "";
    while (LoRa.available()) {
      s += (char)LoRa.read();
    }
    Serial.println("RX: " + s);
    udp.begin(udpPort);
    udp.beginPacket(udpHost, udpPort);
    udp.print(s);
    udp.endPacket();
    udp.stop();
  }
}
