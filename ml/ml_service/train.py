"""
VANET Accident Detection
Optimized Random Forest Training Script
"""

import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


# ----------------------------
# Feature Schema
# ----------------------------

FEATURE_ORDER = [
    "acc_delta",
    "gyro_delta",
    "vibration_intensity",
    "impact_duration",
    "airbag_deployed",
    "wheel_speed_drop_pct",
    "thermal_c",
    "latitude",
    "longitude",
    "initial_speed"
]


# ----------------------------
# Load Dataset
# ----------------------------

print("Loading dataset...")

df = pd.read_csv("dataset.csv")

print("Dataset shape:", df.shape)
print("Columns:", df.columns)


# ----------------------------
# Validate dataset
# ----------------------------

for f in FEATURE_ORDER:
    if f not in df.columns:
        raise Exception(f"Missing column: {f}")

if "severity" not in df.columns:
    raise Exception("Missing target column: severity")


# ----------------------------
# Prepare data
# ----------------------------

X = df[FEATURE_ORDER]
y = df["severity"]

print("\nClass distribution:")
print(y.value_counts())


# ----------------------------
# Train Test Split
# ----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# ----------------------------
# Pipeline
# ----------------------------

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestClassifier(random_state=42))
])


# ----------------------------
# Hyperparameter Grid
# ----------------------------

param_grid = {
    "rf__n_estimators": [100, 200, 300],
    "rf__max_depth": [10, 15, 20],
    "rf__min_samples_split": [2, 5, 10],
    "rf__min_samples_leaf": [1, 2, 4],
    "rf__max_features": ["sqrt", "log2"]
}


# ----------------------------
# Grid Search
# ----------------------------

print("\nRunning hyperparameter optimization...")

grid = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    n_jobs=-1,
    verbose=2
)

grid.fit(X_train, y_train)

best_model = grid.best_estimator_

print("\nBest Parameters:")
print(grid.best_params_)


# ----------------------------
# Evaluation
# ----------------------------

y_pred = best_model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ----------------------------
# Feature Importance
# ----------------------------

rf_model = best_model.named_steps["rf"]

print("\nFeature Importance:")

for feature, importance in zip(FEATURE_ORDER, rf_model.feature_importances_):
    print(f"{feature}: {importance:.4f}")


# ----------------------------
# Save Model
# ----------------------------

MODEL_PATH = os.path.join(os.getcwd(), "model.pkl")

joblib.dump(best_model, MODEL_PATH)

print("\nModel saved to:", MODEL_PATH)


# ----------------------------
# Test Prediction
# ----------------------------

print("\nTesting prediction with sample input...")

sample = np.array([[
    18,      # acc_delta
    3.2,     # gyro_delta
    0.6,     # vibration_intensity
    0.15,    # impact_duration
    1,       # airbag_deployed
    70,      # wheel_speed_drop_pct
    60,      # thermal_c
    19.07,   # latitude
    72.88,   # longitude
    90       # initial_speed
]])

prediction = best_model.predict(sample)

print("Sample Prediction:", prediction)