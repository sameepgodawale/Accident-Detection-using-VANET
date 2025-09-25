#pragma once
#include <stdint.h>

typedef struct { float ax, ay, az; float gx, gy, gz; } imu_sample_t;
void imu_init(void);
int imu_read(imu_sample_t* s);
void imu_isr(void);
