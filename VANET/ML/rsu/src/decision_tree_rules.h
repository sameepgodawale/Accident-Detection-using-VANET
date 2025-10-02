#pragma once
#include <string>
#include <cmath>

// Lightweight rule-based classifier for RSU edge deployment.
// Input features:
// - acc_delta: peak acceleration delta (g)
// - gyro_delta: angle change (degrees)
// - vibration: vibration intensity (0..n)
// - impact_time: duration of impact pattern (seconds)
// - airbag: boolean indicating airbag deployed (if available via CAN)
// - wheel_drop_pct: fraction drop of wheel speed (0..1), -1 if not available

inline std::string classifySeverity(float acc_delta, float gyro_delta, float vibration, float impact_time, bool airbag=false, float wheel_drop_pct=-1.0f) {
    // Highest priority: airbag
    if (airbag) return "Critical";
    // If wheel speed drop large and acceleration big -> Critical
    if (wheel_drop_pct >= 0.0f) {
        if (acc_delta > 10.0f && wheel_drop_pct > 0.6f) return "Critical";
    }
    // Rollover style events (large gyro change)
    if (gyro_delta > 80.0f) return "Critical";
    // High force collisions
    if (acc_delta >= 12.0f) return "Critical";
    if (acc_delta >= 8.0f && gyro_delta > 25.0f) return "Major";
    if (acc_delta >= 6.0f) return "Major";
    if (vibration > 1.0f && impact_time > 0.4f) return "Major";
    // Default
    return "Minor";
}
