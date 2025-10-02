#pragma once
typedef struct {
  const char *label;
  float confidence;
} MlResult;

void ml_init(void);
MlResult ml_classify(float acc_delta, float gyro_delta, float vibration,
                     float impact_time, int airbag, float wheel_drop_pct);
bool ml_load_thresholds(const char *filename);
