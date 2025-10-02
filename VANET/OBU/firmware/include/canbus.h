#pragma once
#include "event.h"

void canbus_init(void);
void canbus_update(void);
void canbus_get_features(event_payload_t *ev);
