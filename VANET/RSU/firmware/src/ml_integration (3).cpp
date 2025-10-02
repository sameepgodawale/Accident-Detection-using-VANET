#include "ml_integration.h"
#include "decision_tree_rules.h"
#include <ArduinoJson.h>
#include <SD.h>

Thresholds TH;

// Load thresholds from SD
bool ml_load_thresholds(const char *filename) {
  File f = SD.open(filename);
  if (!f) {
    Serial.println("[ML] thresholds.json not found, using defaults.");
    setDefaultThresholds(&TH);
    return false;
  }
  StaticJsonDocument<512> doc;
  if (deserializeJson(doc, f)) {
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

// Save thresholds to SD
bool ml_save_thresholds(const char *filename) {
  File f = SD.open(filename, FILE_WRITE);
  if (!f) {
    Serial.println("[ML] Failed to open thresholds.json for writing!");
    return false;
  }
  StaticJsonDocument<512> doc;
  doc["ACC_CRITICAL"] = TH.acc_critical;
  doc["ACC_MAJOR"] = TH.acc_major;
  doc["ACC_MAJOR_COMBO"] = TH.acc_major_combo;
  doc["GYRO_CRITICAL"] = TH.gyro_critical;
  doc["GYRO_MAJOR_COMBO"] = TH.gyro_major_combo;
  doc["VIBRATION_MAJOR"] = TH.vibration_major;
  doc["IMPACT_TIME_MAJOR"] = TH.impact_time_major;
  doc["WHEEL_DROP_CRITICAL_ACC"] = TH.wheel_drop_critical_acc;
  doc["WHEEL_DROP_CRITICAL_PCT"] = TH.wheel_drop_critical_pct;
  if (serializeJson(doc, f) == 0) {
    Serial.println("[ML] Failed to serialize thresholds.json!");
    f.close();
    return false;
  }
  f.close();
  Serial.println("[ML] thresholds.json updated successfully.");
  return true;
}

// Update thresholds from JSON payload (CMS MQTT)
bool ml_update_from_json(const char *json_payload) {
  StaticJsonDocument<512> doc;
  if (deserializeJson(doc, json_payload)) {
    Serial.println("[ML] Invalid JSON payload from MQTT!");
    return false;
  }
  // Update in-memory thresholds
  TH.acc_critical = doc["ACC_CRITICAL"] | TH.acc_critical;
  TH.acc_major = doc["ACC_MAJOR"] | TH.acc_major;
  TH.acc_major_combo = doc["ACC_MAJOR_COMBO"] | TH.acc_major_combo;
  TH.gyro_critical = doc["GYRO_CRITICAL"] | TH.gyro_critical;
  TH.gyro_major_combo = doc["GYRO_MAJOR_COMBO"] | TH.gyro_major_combo;
  TH.vibration_major = doc["VIBRATION_MAJOR"] | TH.vibration_major;
  TH.impact_time_major = doc["IMPACT_TIME_MAJOR"] | TH.impact_time_major;
  TH.wheel_drop_critical_acc = doc["WHEEL_DROP_CRITICAL_ACC"] | TH.wheel_drop_critical_acc;
  TH.wheel_drop_critical_pct = doc["WHEEL_DROP_CRITICAL_PCT"] | TH.wheel_drop_critical_pct;

  // Persist to SD
  return ml_save_thresholds("/thresholds.json");
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
