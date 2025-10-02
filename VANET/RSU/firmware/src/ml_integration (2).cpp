#include "ml_integration.h"
#include "decision_tree_rules.h"
#include <ArduinoJson.h>
#include <SD.h>

Thresholds TH;

bool ml_load_thresholds(const char *filename) {
  File f = SD.open(filename);
  if (!f) {
    Serial.println("[ML] thresholds.json not found, using defaults.");
    setDefaultThresholds(&TH);
    return false;
  }
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, f);
  if (err) {
    Serial.println("[ML] JSON parse failed, using defaults.");
    setDefaultThresholds(&TH);
    return false;
  }
  TH.acc_critical = doc["ACC_CRITICAL"] | 12.0;
  TH.acc_major = doc["ACC_MAJOR"] | 6.0;
  TH.acc_major_combo = doc["ACC_MAJOR_COMBO"] | 8.0;
  TH.gyro_critical = doc["GYRO_CRITICAL"] | 80.0;
  TH.gyro_major_combo = doc["GYRO_MAJOR_COMBO"] | 25.0;
  TH.vibration_major = doc["VIBRATION_MAJOR"] | 1.0;
  TH.impact_time_major = doc["IMPACT_TIME_MAJOR"] | 0.4;
  TH.wheel_drop_critical_acc = doc["WHEEL_DROP_CRITICAL_ACC"] | 10.0;
  TH.wheel_drop_critical_pct = doc["WHEEL_DROP_CRITICAL_PCT"] | 0.6;
  Serial.println("[ML] thresholds.json loaded successfully.");
  return true;
}

void ml_init(void) {
  if (!ml_load_thresholds("/thresholds.json")) {
    Serial.println("[ML] Using default thresholds.");
  }
}

MlResult ml_classify(float acc_delta, float gyro_delta, float vibration,
                     float impact_time, int airbag, float wheel_drop_pct) {
  MlResult r;
  float conf = 0.0f;
  const char *lab = classifySeverity(acc_delta, gyro_delta, vibration,
                                     impact_time, airbag, wheel_drop_pct,
                                     &conf, &TH);
  r.label = lab;
  r.confidence = conf;
  return r;
}
