#include "event.h"
#include "imu.h"
#include "gps.h"
#include "lora.h"
#include "canbus.h"
#include "json_builder.h"
#include <stdio.h>

void event_manager_init(void) {
    imu_init();
    gps_init();
    lora_init();
    canbus_init();
}

void event_manager_loop(void) {
    imu_update();
    gps_update();
    canbus_update();

    if (imu_check_crash()) {
        event_payload_t ev;
        imu_get_features(&ev);
        gps_get_location(&ev);
        canbus_get_features(&ev);

        char json_buf[512];
        build_event_json(&ev, json_buf, sizeof(json_buf));

        lora_send(json_buf);
        storage_log(json_buf);
    }
}
