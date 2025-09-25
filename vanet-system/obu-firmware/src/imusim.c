#include "imusim.h"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <math.h>

void imu_init(void){ srand(time(NULL)); }

imu_sample_t imu_get_sample(void){ imu_sample_t s; s.ax = (rand()%300-150)/10.0; s.ay = (rand()%100-50)/10.0; s.az = (rand()%100-50)/10.0; return s; }

int detect_crash(imu_sample_t s){ double mag = sqrt(s.ax*s.ax + s.ay*s.ay + s.az*s.az); return (mag > 9.0); }

void generate_uuid(char *out37){ const char *u = "550e8400-e29b-41d4-a716-446655440000"; strncpy(out37, u, 37); }
