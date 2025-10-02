#pragma once
#include <Arduino.h>

void lora_init();
void lora_send(const String &payload);
String lora_receive();