#include "lora_handler.h"
#include <SPI.h>
#include <LoRa.h>

#define LORA_SS 5
#define LORA_RST 14
#define LORA_DIO0 2
#define LORA_FREQ 433E6

void lora_init() {
  SPI.begin(18, 19, 23, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQ)) {
    Serial.println("LoRa init failed!");
    while (1) delay(1000);
  }
  LoRa.setSyncWord(0xF3);
  Serial.println("LoRa ready");
}

void lora_send(const String &payload) {
  LoRa.beginPacket();
  LoRa.print(payload);
  LoRa.endPacket();
}

String lora_receive() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String msg = "";
    while (LoRa.available()) msg += (char)LoRa.read();
    return msg;
  }
  return "";
}