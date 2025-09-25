#pragma once
#include <stdint.h>
#define EVENT_TYPE_CRASH 1
#define EVENT_TYPE_FIRE 2

typedef struct {
    char event_uuid[37];
    int event_type;
    double lat, lon;
    uint32_t timestamp;
    int status;
    int retry_count;
} event_t;

void event_store_init(const char *path);
int event_store_add(event_t *e);
int event_store_get_pending(event_t **out_array, int max);
void event_store_mark_acked(const char *uuid);
