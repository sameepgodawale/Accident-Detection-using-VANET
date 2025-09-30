#pragma once
#include "event.h"

#define IMU_ACC_THRESHOLD_G 6.0
#define IMU_GYRO_THRESHOLD_DEG 40.0

void imu_init(void);
void imu_update(void);
int imu_check_crash(void);
void imu_get_features(event_payload_t *ev);
