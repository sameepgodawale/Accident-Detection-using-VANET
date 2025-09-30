#include "lora.h"
#include <stdio.h>

void lora_init(void) {
    printf("LoRa SX1278 init.\n");
}

int lora_send(const char *payload) {
    printf("LoRa TX: %s\n", payload);
    return 1;
}
