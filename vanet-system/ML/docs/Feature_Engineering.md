# Feature Engineering

Required features (recommended):
- acc_delta: peak acceleration (g)
- gyro_delta: angle change (degrees)
- vibration: amplitude
- impact_time: seconds
- airbag_deployed: 0/1
- wheel_speed_drop_pct: 0..1 or -1 if unknown

Notes:
- Use rolling windows to compute pre/post values for wheel speed and CAN signals.
- Normalize numeric features before training.
