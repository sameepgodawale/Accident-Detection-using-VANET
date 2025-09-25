pragma once
#include <stdint.h>
#include <stddef.h>
void lora_init(void); int lora_send(const uint8_t*,size_t); int lora_receive(uint8_t*,size_t);
