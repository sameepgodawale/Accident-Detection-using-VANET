#pragma once

typedef struct {
  float acc_critical;
  float acc_major;
  float acc_major_combo;
  float gyro_critical;
  float gyro_major_combo;
  float vibration_major;
  float impact_time_major;
  float wheel_drop_critical_acc;
  float wheel_drop_critical_pct;
} Thresholds;

static inline void setDefaultThresholds(Thresholds *TH) {
  TH->acc_critical = 12.0f;
  TH->acc_major = 6.0f;
  TH->acc_major_combo = 8.0f;
  TH->gyro_critical = 80.0f;
  TH->gyro_major_combo = 25.0f;
  TH->vibration_major = 1.0f;
  TH->impact_time_major = 0.4f;
  TH->wheel_drop_critical_acc = 10.0f;
  TH->wheel_drop_critical_pct = 0.6f;
}

static inline const char* classifySeverity(
    float acc_delta, float gyro_delta, float vibration,
    float impact_time, int airbag, float wheel_drop_pct,
    float *out_confidence, Thresholds *TH
) {
  const char *label = "Minor";
  float conf = 0.45f;

  if (airbag) { label="Critical"; conf=0.95f; goto END; }
  if (wheel_drop_pct >= 0 &&
      acc_delta >= TH->wheel_drop_critical_acc &&
      wheel_drop_pct >= TH->wheel_drop_critical_pct) {
    label="Critical"; conf=0.92f; goto END;
  }
  if (gyro_delta > TH->gyro_critical || acc_delta >= TH->acc_critical) {
    label="Critical"; conf=0.90f; goto END;
  }
  if (acc_delta >= TH->acc_major_combo && gyro_delta > TH->gyro_major_combo) {
    label="Major"; conf=0.75f; goto END;
  }
  if (acc_delta >= TH->acc_major) { label="Major"; conf=0.70f; goto END; }
  if (vibration > TH->vibration_major && impact_time > TH->impact_time_major) {
    label="Major"; conf=0.65f; goto END;
  }

END:
  if (out_confidence) *out_confidence = conf;
  return label;
}
