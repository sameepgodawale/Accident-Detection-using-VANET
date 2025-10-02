#pragma once
#include <Arduino.h>

typedef struct {
  const char *label;
  float confidence;
} MlResult;

void ml_init();
MlResult ml_classify(float acc_delta, float gyro_delta, float vibration, float impact_time, bool airbag, float wheel_drop_pct);