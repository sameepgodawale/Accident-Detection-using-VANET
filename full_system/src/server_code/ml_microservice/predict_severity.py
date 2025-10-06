import sys
import json
import joblib
import pandas as pd

# --- Configuration ---
MODEL_PATH = './ml_module/cms_model/final_model.pkl' # Adjusted path for execution context
MODEL = None

def load_model():
    """Loads the pre-trained Random Forest model."""
    global MODEL
    if MODEL is None:
        try:
            # Assumes the model is saved in the path relative to where the script is run from
            MODEL = joblib.load(MODEL_PATH) 
        except Exception as e:
            print(json.dumps({"error": f"Failed to load ML model: {e}"}))
            sys.exit(1)

def predict_severity(data):
    """Predicts severity and confidence score from OBU data."""
    
    FEATURES = ['acc_delta', 'gyro_delta', 'impact_time', 'airbag_deployed', 'wheel_speed_drop_pct']
    
    # Create DataFrame from input data
    input_df = pd.DataFrame([data], columns=FEATURES)

    # 1. Prediction
    prediction = MODEL.predict(input_df)[0]
    
    # 2. Confidence Score
    probabilities = MODEL.predict_proba(input_df)[0]
    confidence = max(probabilities)
    
    confidence_score = int(confidence * 100)

    return prediction, confidence_score

if __name__ == "__main__":
    load_model()
    input_data = sys.stdin.read()
    
    if not input_data:
        print(json.dumps({"error": "No data received for prediction."}))
        sys.exit(1)
        
    try:
        payload = json.loads(input_data)
        
        severity, confidence = predict_severity(payload)
        
        # Output result as JSON for Node.js to consume
        print(json.dumps({
            "severity": severity,
            "confidenceScore": confidence
        }))

    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {e}"}))
