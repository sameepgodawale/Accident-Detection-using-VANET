#pragma once
#include <stdint.h>

typedef struct { float ax, ay, az; } imu_sample_t;

void imu_init(void);
imu_sample_t imu_get_sample(void);
int detect_crash(imu_sample_t s);
void generate_uuid(char *out37);
