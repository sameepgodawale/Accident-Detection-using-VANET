#pragma once
#include <stdint.h>
int lora_init(void);
int lora_send(const uint8_t *buf, uint8_t len);
int lora_receive(uint8_t *buf, uint8_t maxlen);
