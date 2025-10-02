#include "json_builder.h"
#include <stdio.h>

void build_event_json(event_payload_t *ev, char *buf, size_t buflen) {
    snprintf(buf, buflen,
        "{ \"device_id\":\"%s\", \"acc_delta\":%.2f, \"gyro_delta\":%.2f, "
        "\"impact_time\":%.2f, \"lat\":%.6f, \"lon\":%.6f, "
        "\"airbag\":%d, \"wheel_before\":%.1f, "
        "\"wheel_after\":%.1f, \"drop_pct\":%.2f }",
        ev->device_id, ev->acc_delta, ev->gyro_delta,
        ev->impact_time, ev->lat, ev->lon,
        ev->airbag_deployed, ev->wheel_speed_before,
        ev->wheel_speed_after, ev->wheel_speed_drop_pct);
}
