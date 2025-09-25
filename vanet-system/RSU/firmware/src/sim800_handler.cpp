// sim800_handler.cpp - helper functions for SIM800L interactions
#include <Arduino.h>
#include "config.h"
extern HardwareSerial SIMSerial;

bool sim800_wait_for(const char* expect, unsigned long timeout) {
  unsigned long start = millis(); String resp = "";
  while (millis() - start < timeout) {
    while (SIMSerial.available()) { resp += (char)SIMSerial.read(); }
    if (resp.indexOf(expect) >= 0) return true;
  }
  return false;
}

void sim800_power_cycle() {
  digitalWrite(SIM_PWKEY_PIN, HIGH);
  delay(1000);
  digitalWrite(SIM_PWKEY_PIN, LOW);
}

// ... further helpers can be implemented as needed
