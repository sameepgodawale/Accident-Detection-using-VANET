#include "ml_integration.h"
#include "decision_tree_rules.h"
#include <algorithm>

void ml_init() {}

MlResult ml_classify(float acc_delta, float gyro_delta, float vibration, float impact_time, bool airbag, float wheel_drop_pct) {
  MlResult r;
  const char *label = classifySeverity(acc_delta, gyro_delta, vibration, impact_time, airbag, wheel_drop_pct);
  r.label = label;
  float conf = 0.5f;
  if (strcmp(label, "Critical") == 0) conf = 0.9f;
  else if (strcmp(label, "Major") == 0) conf = 0.7f;
  if (airbag) conf = std::max(conf, 0.95f);
  if (wheel_drop_pct > 0.5f) conf = std::max(conf, 0.85f);
  r.confidence = conf;
  return r;
}