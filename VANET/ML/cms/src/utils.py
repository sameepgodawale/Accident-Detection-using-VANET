import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

FEATURES = ['acc_delta','gyro_delta','vibration','impact_time','airbag_deployed','wheel_speed_drop_pct']
TARGET = 'severity'

def load_and_clean(csv_paths):
    df_list = [pd.read_csv(p) for p in csv_paths]
    df = pd.concat(df_list, ignore_index=True)
    # Basic cleaning: drop rows without target
    df = df.dropna(subset=[TARGET])
    # Impute wheel_speed_drop_pct missing with -1 (signal not available)
    if 'wheel_speed_drop_pct' in df.columns:
        df['wheel_speed_drop_pct'] = df['wheel_speed_drop_pct'].fillna(-1)
    # Convert booleans
    df['airbag_deployed'] = df['airbag_deployed'].fillna(0).astype(int)
    return df

def preprocess(df, scaler=None):
    X = df[FEATURES].copy()
    # Replace NaNs
    X = X.fillna(0)
    if scaler is None:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    return X_scaled, df[TARGET].values, scaler
