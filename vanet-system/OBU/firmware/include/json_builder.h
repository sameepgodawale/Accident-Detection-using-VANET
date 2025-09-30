#pragma once
#include "event.h"
#include <stddef.h>

void build_event_json(event_payload_t *ev, char *buf, size_t buflen);
