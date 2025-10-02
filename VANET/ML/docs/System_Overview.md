# System Overview

This ML module supports a hybrid deployment:
- RSU runs the deterministic rule-based classifier (immediate, reliable)
- CMS trains and serves data-driven models (Random Forest) using real labeled telemetry

Flow:
1. OBU detects an event and forwards features via LoRa.
2. RSU classifies locally using the rules and acts immediately if critical.
3. RSU forwards full feature payload to CMS.
4. CMS performs server-side inference (higher accuracy) and stores results.
5. CMS can retrain periodically and publish new rules/models to RSUs via provisioning.
