# VANET ML Module — RSU (edge) & CMS (server) ready package

Generated: 2025-09-29T12:53:00.350882Z

This package provides a complete Machine Learning module for classifying accident severity in the VANET accident-detection system.

Two deployment targets are supported:
- `rsu/` — lightweight, deterministic decision rules for RSU edge inference (C/C++ ready header and test harness). This is deployable off-the-shelf and does not require ML training data to operate.
- `cms/` — training and server-side inference components. Includes training scripts, a Flask inference service, preprocessing utilities, and documentation. **Important:** CMS requires a trained model from real labeled data. The repo includes tooling to train and evaluate models but intentionally does not ship a fabricated pre-trained model. See CMS/README.md for training instructions.

Why this design: immediate RSU capability (rule-based) ensures critical alerts can be raised without waiting for a trained model; CMS holds more sophisticated ML trained from real, labeled accident telemetry, enabling continuous improvement.

License: MIT
