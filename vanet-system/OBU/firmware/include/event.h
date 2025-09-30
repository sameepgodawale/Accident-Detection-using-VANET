#pragma once

typedef struct {
    char device_id[16];
    float acc_delta;
    float gyro_delta;
    float impact_time;
    float lat;
    float lon;
    int has_gps;
    int airbag_deployed;
    float wheel_speed_before;
    float wheel_speed_after;
    float wheel_speed_drop_pct;
} event_payload_t;

void event_manager_init(void);
void event_manager_loop(void);
