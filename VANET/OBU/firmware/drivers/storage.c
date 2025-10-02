#include "storage.h"
#include <stdio.h>

void storage_init(void) {
    printf("Storage init.\n");
}

void storage_log(const char *payload) {
    printf("Log: %s\n", payload);
}
