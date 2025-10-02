#include "canbus.h"
#include <stdio.h>

void canbus_init(void) {
    printf("CAN bus init.\n");
}

void canbus_update(void) {
    // Poll CAN buffer
}

void canbus_get_features(event_payload_t *ev) {
    ev->airbag_deployed = 0;
    ev->wheel_speed_before = 80;
    ev->wheel_speed_after = 20;
    ev->wheel_speed_drop_pct = 0.75;
}
