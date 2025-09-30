#pragma once
#include "event.h"

void gps_init(void);
void gps_update(void);
void gps_get_location(event_payload_t *ev);
