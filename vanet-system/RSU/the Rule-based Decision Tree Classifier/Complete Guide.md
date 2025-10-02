# Rule-based Decision Tree Classifier — Complete Guide

**Goal:** classify accident events into `Minor`, `Major`, `Critical` in the RSU, using lightweight decisions based on features sent from OBUs (and optionally CAN).

---

## 1 — Summary
- **Type:** Deterministic, rule-based decision tree (hand-crafted rules).  
- **Input features:**
  - `acc_delta` — acceleration delta (g)  
  - `gyro_delta` — gyroscope change (deg/s)  
  - `vibration` — vibration intensity  
  - `impact_time` — impact duration (s)  
  - `airbag` — airbag deployment (bool)  
  - `wheel_drop_pct` — wheel speed drop (0–1 or -1 if unknown)  
- **Output:** Severity label (`Minor`, `Major`, `Critical`) + confidence score (0–1).  
- **Execution:** Runs on RSU (ESP32), after receiving OBU packets via LoRa.  

---

## 2 — Why Rule-based?
- Extremely lightweight and deterministic.  
- Fully explainable decisions.  
- Requires no training data to begin.  
- Easy to maintain & tune with real data.  

---

## 3 — Features & Preprocessing

| Feature | Unit | Description | Preprocessing |
|---------|------|-------------|---------------|
| `acc_delta` | g | Peak acceleration delta | Fused IMU outputs |
| `gyro_delta` | deg/s | Angular velocity change | From both IMUs |
| `vibration` | unitless | RMS vibration level | Normalize by idle baseline |
| `impact_time` | s | Duration of collision | Compute above-threshold duration |
| `airbag` | bool | Airbag deployment | CAN bus flag |
| `wheel_drop_pct` | % | (speed_before - speed_after)/speed_before | -1 if unknown |

---

## 4 — Decision Rules

```text
1. If airbag == true → Critical
2. Else if acc_delta >= 10.0 AND wheel_drop_pct >= 0.6 → Critical
3. Else if gyro_delta > 80.0 OR acc_delta >= 12.0 → Critical
4. Else if acc_delta >= 8.0 AND gyro_delta > 25.0 → Major
5. Else if acc_delta >= 6.0 → Major
6. Else if vibration > 1.0 AND impact_time > 0.4 → Major
7. Else → Minor
````

---

## 5 — Confidence Scoring

| Rule                              | Confidence |
| --------------------------------- | ---------- |
| Airbag deployed                   | 0.95       |
| Acc ≥10 g & wheel drop ≥60%       | 0.92       |
| Gyro >80 or acc ≥12 g             | 0.90       |
| Acc ≥8 g & gyro >25               | 0.75       |
| Acc ≥6 g                          | 0.70       |
| Vibration >1.0 & impact_time >0.4 | 0.65       |
| Default Minor                     | 0.45       |

---

## 6 — Pseudocode

```python
def classify(acc_delta, gyro_delta, vibration, impact_time, airbag, wheel_drop_pct):
    if airbag:
        return "Critical", 0.95
    if wheel_drop_pct >= 0 and acc_delta >= 10.0 and wheel_drop_pct >= 0.6:
        return "Critical", 0.92
    if gyro_delta > 80.0 or acc_delta >= 12.0:
        return "Critical", 0.90
    if acc_delta >= 8.0 and gyro_delta > 25.0:
        return "Major", 0.75
    if acc_delta >= 6.0:
        return "Major", 0.70
    if vibration > 1.0 and impact_time > 0.4:
        return "Major", 0.65
    return "Minor", 0.45
```

---

## 7 — Embedded C Implementation

```c
// decision_tree_rules.h
#pragma once

static inline const char* classifySeverity(
    float acc_delta, float gyro_delta, float vibration,
    float impact_time, int airbag, float wheel_drop_pct,
    float *out_confidence
) {
    const char *label = "Minor";
    float conf = 0.45f;

    if (airbag) { label="Critical"; conf=0.95f; goto END; }
    if (wheel_drop_pct >= 0 && acc_delta >= 10.0f && wheel_drop_pct >= 0.6f) {
        label="Critical"; conf=0.92f; goto END;
    }
    if (gyro_delta > 80.0f || acc_delta >= 12.0f) {
        label="Critical"; conf=0.90f; goto END;
    }
    if (acc_delta >= 8.0f && gyro_delta > 25.0f) {
        label="Major"; conf=0.75f; goto END;
    }
    if (acc_delta >= 6.0f) { label="Major"; conf=0.70f; goto END; }
    if (vibration > 1.0f && impact_time > 0.4f) {
        label="Major"; conf=0.65f; goto END;
    }

END:
    if (out_confidence) *out_confidence = conf;
    return label;
}
```

---

## 8 — Example Test Vectors

| acc_delta | gyro_delta | vibration | impact_time | airbag | wheel_drop_pct | Expected |
| --------- | ---------- | --------- | ----------- | ------ | -------------- | -------- |
| 0.8       | 4.0        | 0.2       | 0.05        | 0      | -1             | Minor    |
| 6.5       | 20.0       | 0.3       | 0.18        | 0      | 0.40           | Major    |
| 11.2      | 50.0       | 1.8       | 0.30        | 0      | 0.72           | Critical |
| 4.0       | 90.0       | 0.6       | 0.10        | 0      | -1             | Critical |
| 7.5       | 30.0       | 1.3       | 0.6         | 0      | 0.25           | Major    |
| 3.0       | 2.0        | 0.9       | 0.45        | 0      | -1             | Minor    |

---

## 9 — Calibration Procedure

1. Collect real/simulated events (with sensors).
2. Extract features consistently.
3. Manually label events (Minor/Major/Critical).
4. Run classifier on dataset.
5. Compute confusion matrix.
6. Adjust thresholds based on false positives/negatives.
7. Lock tuned thresholds into firmware.

---

## 10 — Example Confusion Matrix

| True\Pred | Minor | Major | Critical |
| --------- | ----- | ----- | -------- |
| Minor     | 420   | 30    | 5        |
| Major     | 35    | 210   | 10       |
| Critical  | 3     | 8     | 279      |

* Accuracy ≈ 91%
* Critical recall ≈ 96%
* Critical precision ≈ 95%

---

## 11 — Integration in RSU

```c
float conf;
const char *severity = classifySeverity(
    ev.acc_delta, ev.gyro_delta, ev.vibration, ev.impact_time,
    ev.airbag, ev.wheel_drop_pct, &conf
);
json["rsu_severity"] = severity;
json["rsu_confidence"] = conf;
```

* Append results to MQTT payload.
* If `Critical`, also trigger SMS + alert topic publish.

---

## 12 — Advantages & Limitations

**Advantages:**

* Tiny code size, <1KB.
* Runs in microseconds on ESP32.
* Explainable and auditable.

**Limitations:**

* Requires careful tuning for different vehicles.
* Cannot adapt automatically without reprogramming.
* May misclassify rare or unusual crashes.

---
