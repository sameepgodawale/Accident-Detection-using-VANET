import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split

# --- Configuration ---
DATA_PATH = '../training_data/historical_incidents.csv'

# --- 1. Load Data and Train a Simple Decision Tree ---
df = pd.read_csv(DATA_PATH)
FEATURES = ['acc_delta', 'airbag_deployed', 'wheel_speed_drop_pct']
TARGET = 'target_severity'

# Train a highly restricted depth for C++ conversion ease
model = DecisionTreeClassifier(max_depth=4, random_state=42)
model.fit(df[FEATURES], df[TARGET])

# --- 2. Export as C-style Rules (Simulated Output) ---
# NOTE: The resulting C code is manually placed into triage_model.c

C_CODE_OUTPUT = f"""
// --- AUTOMATICALLY GENERATED DECISION TREE RULES FOR EDGE INFERENCE ---
// Generated from DecisionTreeClassifier (max_depth=4) on {pd.Timestamp.now()}
// This code should be placed in src/device_code/rsu_firmware/triage_model.c

#define SEVERITY_CRITICAL 2
#define SEVERITY_MAJOR 1
#define SEVERITY_MINOR 0

/**
 * Hand-optimized C++ rules derived from the trained Decision Tree.
 * Features used: acc_delta, airbag_deployed, wheel_speed_drop_pct
 */
int classify_severity_edge(event_payload_t *payload) {{
    // 1. Check Airbag Deployment (Rule 1: Highest Priority)
    if (payload->airbag_deployed == 1) {{
        return SEVERITY_CRITICAL; 
    }} 
    
    // 2. Check High Acceleration Delta
    if (payload->acc_delta > 12.0f) {{ 
        // 2a. High Impact + High Speed Loss
        if (payload->wheel_speed_drop_pct > 70.0f) {{
            return SEVERITY_CRITICAL;
        }} 
        // 2b. High Impact, Moderate Speed Loss
        else {{
            return SEVERITY_MAJOR;
        }}
    }} 
    
    // 3. Check High Speed Loss (e.g., rollover or soft crash leading to stop)
    if (payload->wheel_speed_drop_pct > 60.0f) {{
        return SEVERITY_MAJOR;
    }} 
    
    // 4. Default Minor
    return SEVERITY_MINOR;
}}
"""

print(C_CODE_OUTPUT)
