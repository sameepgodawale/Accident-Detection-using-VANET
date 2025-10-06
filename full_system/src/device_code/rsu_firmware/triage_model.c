#include "event.h"

// Define Severity Types for C code
#define SEVERITY_MINOR 0
#define SEVERITY_MAJOR 1
#define SEVERITY_CRITICAL 2

/**
 * @brief Classifies the accident severity using a hardcoded Decision Tree.
 * This is the crucial EDGE inference logic for RSU resilience.
 * @param payload The raw event payload data from the OBU.
 * @return int Severity level (0, 1, or 2).
 */
int classify_severity_edge(event_payload_t *payload) {
    
    // --- DECISION TREE LOGIC (MAX DEPTH 4) ---
    // Derived from offline training (ml_module/edge_model/generate_c_rules.py)

    // 1. Check Airbag Deployment (Rule 1: Highest Priority)
    if (payload->airbag_deployed == 1) {
        return SEVERITY_CRITICAL;
    } 
    
    // 2. Check High Acceleration Delta
    if (payload->acc_delta > 12.0f) { 
        // 2a. High Impact + High Speed Loss
        if (payload->wheel_speed_drop_pct > 70.0f) {
            return SEVERITY_CRITICAL;
        } 
        // 2b. High Impact, Moderate Speed Loss
        else {
            return SEVERITY_MAJOR;
        }
    } 
    
    // 3. Check High Speed Loss (e.g., rollover or soft crash leading to stop)
    if (payload->wheel_speed_drop_pct > 60.0f) {
        return SEVERITY_MAJOR;
    } 
    
    // 4. Default Minor
    return SEVERITY_MINOR;
}
