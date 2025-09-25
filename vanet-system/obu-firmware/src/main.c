/* main.c stub */
#include "imu.h"
#include "gps.h"
int main(void){ imu_init(); gps_init(); while(1){ imu_poll(); gps_poll(); } return 0; }
