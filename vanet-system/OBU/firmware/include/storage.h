#pragma once
#include <stdint.h>
#include "event.h"

int storage_init(void);
int storage_append_event(const event_meta_t *e, const void *payload, uint32_t payload_len);
int storage_mark_acked(const char *uuid);
int storage_get_pending(event_meta_t *out_array, int max);
int storage_delete_old(int older_than_seconds);
