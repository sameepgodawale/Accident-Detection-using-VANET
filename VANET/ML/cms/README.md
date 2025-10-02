# CMS ML — Server-side training & inference

This folder includes the training pipeline, model evaluation tools, and a Flask-based inference service to classify accident severity on the CMS.

**Important**: The CMS ML requires a labeled dataset of real accident telemetry to train an accurate model. For safety and correctness, **do NOT** use synthetic or unlabeled data as your production model.

Contents:
- src/train.py           : Training script using scikit-learn (Random Forest default)
- src/evaluate.py        : Model evaluation & metrics
- src/classify_service.py: Flask service that loads `model.pkl` and serves `/classify` endpoint
- src/utils.py          : Preprocessing and feature handling utilities
- model/                : (empty) place `severity_model.pkl` and `scaler.pkl` here after training
- data/                 : (empty) place your raw and processed datasets here

Requirements:
- Python 3.8+
- See requirements.txt for full dependency list

To train:
1. Put labeled CSV files in `cms/data/raw/` containing at minimum the features:
   acc_delta, gyro_delta, vibration, impact_time, airbag_deployed, wheel_speed_drop_pct, severity
2. Run: `python3 src/train.py --data_dir cms/data/ --out model/` (reads processed CSVs, trains model)
3. After training, copy `model/severity_model.pkl` to production server and configure `classify_service.py`.

The project ships with a deterministic RSU classifier so the system can operate while you gather labeled data for CMS.
