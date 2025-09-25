#include "../include/imu.h"
#include <stdlib.h>
#include <time.h>
#include <math.h>

void imu_init(void){ srand(time(NULL)); }
int imu_read(imu_sample_t* s){ s->ax = (rand()%200-100)/10.0f; s->ay=0; s->az=0; return 0; }
