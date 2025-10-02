#include "storage_handler.h"
#include <SPI.h>
#include <SD.h>

#define SD_CS_PIN 4

void storage_init() {
  if (!SD.begin(SD_CS_PIN)) Serial.println("[SD] init failed");
  else Serial.println("[SD] ready");
}

void storage_log(const String &data) {
  File f = SD.open("/events.log", FILE_APPEND);
  if (f) { f.println(data); f.close(); }
  else Serial.println("[SD] write fail");
}