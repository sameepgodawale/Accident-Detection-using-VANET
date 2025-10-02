#include "imu.h"
#include <math.h>
#include <stdio.h>

// Stub: replace with STM32 HAL I2C reads
static float mpu6050_ax, mpu6050_ay, mpu6050_az;
static float mpu9250_ax, mpu9250_ay, mpu9250_az;
static float mpu6050_gx, mpu6050_gy, mpu6050_gz;
static float mpu9250_gx, mpu9250_gy, mpu9250_gz;

static float acc_delta = 0;
static float gyro_delta = 0;
static float impact_time = 0.0;

void imu_init(void) {
    printf("Initializing MPU6050 and MPU9250...\n");
    // Configure both IMUs via I2C
}

void imu_update(void) {
    // Dummy values (replace with I2C HAL reads)
    mpu6050_ax = 1.1; mpu6050_ay = 0.2; mpu6050_az = 9.7;
    mpu9250_ax = 0.9; mpu9250_ay = 0.1; mpu9250_az = 9.6;

    mpu6050_gx = 2.0; mpu6050_gy = 0.5; mpu6050_gz = 1.0;
    mpu9250_gx = 3.0; mpu9250_gy = 0.4; mpu9250_gz = 1.2;

    // Magnitudes
    float acc6050 = sqrt(mpu6050_ax*mpu6050_ax + mpu6050_ay*mpu6050_ay + mpu6050_az*mpu6050_az);
    float acc9250 = sqrt(mpu9250_ax*mpu9250_ax + mpu9250_ay*mpu9250_ay + mpu9250_az*mpu9250_az);

    float gyro6050 = sqrt(mpu6050_gx*mpu6050_gx + mpu6050_gy*mpu6050_gy + mpu6050_gz*mpu6050_gz);
    float gyro9250 = sqrt(mpu9250_gx*mpu9250_gx + mpu9250_gy*mpu9250_gy + mpu9250_gz*mpu9250_gz);

    // Fusion
    acc_delta = (acc6050 + acc9250) / 2.0;
    gyro_delta = fmax(gyro6050, gyro9250);
    impact_time = 0.2; // placeholder
}

int imu_check_crash(void) {
    return (acc_delta > IMU_ACC_THRESHOLD_G || gyro_delta > IMU_GYRO_THRESHOLD_DEG);
}

void imu_get_features(event_payload_t *ev) {
    ev->acc_delta = acc_delta;
    ev->gyro_delta = gyro_delta;
    ev->impact_time = impact_time;
}
