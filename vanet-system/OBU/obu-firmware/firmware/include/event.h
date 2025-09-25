#pragma once
#include <stdint.h>
#define EVENT_UUID_LEN 37

typedef enum { EVT_PENDING=0, EVT_SENT=1, EVT_ACKED=2, EVT_FAILED=3 } evt_status_t;

typedef struct {
    char uuid[EVENT_UUID_LEN];
    uint32_t timestamp; // unix
    float lat, lon;
    uint8_t type; // 1=CRASH,2=FIRE
    uint8_t severity; // 0..3
    uint8_t retry_count;
    evt_status_t status;
} event_meta_t;

#endif
