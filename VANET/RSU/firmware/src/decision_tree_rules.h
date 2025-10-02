#pragma once
#include <cstring>

inline const char* classifySeverity(float acc_delta, float gyro_delta, float vibration, float impact_time, bool airbag=false, float wheel_drop_pct=-1.0f) {
  if (airbag) return "Critical";
  if (wheel_drop_pct >= 0.0f && acc_delta > 10.0f && wheel_drop_pct > 0.6f) return "Critical";
  if (gyro_delta > 80.0f || acc_delta >= 12.0f) return "Critical";
  if (acc_delta >= 8.0f && gyro_delta > 25.0f) return "Major";
  if (acc_delta >= 6.0f) return "Major";
  if (vibration > 1.0f && impact_time > 0.4f) return "Major";
  return "Minor";
}