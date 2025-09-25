#pragma once
typedef struct{float ax,ay,az;} imu_sample_t; void imu_init(void); int imu_read(imu_sample_t*out); void imu_poll(void);
