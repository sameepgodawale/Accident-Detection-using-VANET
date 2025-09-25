#include "transmit.h"
#include "event_store.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>

static int rsu_port = 17000;
static char rsu_host[128] = "127.0.0.1";

void transmit_init(int port, const char *host){ rsu_port = port; strncpy(rsu_host, host, sizeof(rsu_host)-1); }

void transmit_loop_iteration(void){ printf("[TRANSMIT] scanning pending events...\n"); /* In simulation we just print; real impl would build packet and send via LoRa/V2V */ }
