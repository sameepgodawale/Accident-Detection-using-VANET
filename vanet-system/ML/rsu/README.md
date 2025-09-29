# RSU ML (Edge) — README

This folder contains a compact, deterministic rule-based classifier exported as a C++ header and a small test harness. The rules are derived from domain heuristics (acceleration delta, gyro change, vibration intensity, impact duration, plus optional CAN features such as airbag flag and wheel speed drop). The RSU-side classifier is intentionally deterministic so it can be deployed immediately (off-the-shelf) without any training data.

Files:
- src/decision_tree_rules.h  : C header with `classifySeverity()` function (string return: Minor/Major/Critical)
- src/classify.cpp           : Simple C++ file demonstrating function usage
- src/test_rsu.cpp           : Console test harness to compile and run locally
- docs/RSU_Deployment.md     : Integration notes for embedding header into RSU firmware

Why a rule-based RSU:
- Guarantees immediate operation and deterministic behavior.
- Avoids shipping untrained ML weights that could misclassify.
- Serves as a fallback while CMS model is trained and deployed.

To embed into RSU firmware (ESP32 C++):
1. Copy `decision_tree_rules.h` into your firmware project.
2. Call `classifySeverity(...)` on event features extracted from OBU payload.
3. Use the returned string to trigger local actions (GSM alert for Critical, etc.).
