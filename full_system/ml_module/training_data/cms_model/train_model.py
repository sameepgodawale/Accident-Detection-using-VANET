import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# --- Configuration ---
DATA_PATH = '../training_data/historical_incidents.csv'
MODEL_SAVE_PATH = 'final_model.pkl'

# --- 1. Load Data ---
try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    print(f"Error: Training data not found at {DATA_PATH}")
    exit()

# Define features (matching event_payload_t)
FEATURES = ['acc_delta', 'gyro_delta', 'impact_time', 'airbag_deployed', 'wheel_speed_drop_pct']
TARGET = 'target_severity'

X = df[FEATURES]
y = df[TARGET]

# --- 2. Train Model (Random Forest for robust classification) ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Evaluate (Simplified for demonstration)
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Trained Successfully. Accuracy: {accuracy:.2f}")

# --- 3. Save Model and Feature List ---
joblib.dump(model, MODEL_SAVE_PATH)
print(f"Model saved to {MODEL_SAVE_PATH}")

# Save feature list for robust API input handling
with open('model_features.txt', 'w') as f:
    f.write('\n'.join(FEATURES))

print("Training complete. Deploy final_model.pkl to the CMS server.")
