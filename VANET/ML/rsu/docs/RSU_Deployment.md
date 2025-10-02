# RSU Deployment Notes for Rule-based Classifier

This document explains how to use the RSU rule-based classifier header in production.

1. Copy 'decision_tree_rules.h' to your RSU firmware project.
2. When an OBU event arrives, compute/parse following features:
   - acc_delta (float): peak G value
   - gyro_delta (float): angle change in degrees
   - vibration (float): amplitude
   - impact_time (float): event pattern duration in seconds
   - airbag (bool): if MCP2515 CAN listener flagged airbag deployed
   - wheel_drop_pct (float): fraction drop (0..1) or -1 if not available
3. Call `classifySeverity(...)` and take action:
   - Critical -> immediate GSM alert + persist
   - Major -> persist + priority upload
   - Minor -> persist only

Notes:
- This rule set is intentionally conservative and should be tuned with local data before large-scale deployment.
- To upgrade to a data-driven model, follow CMS training instructions and export a small tree into rules.
