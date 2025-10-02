Explains each module:
- main.cpp: orchestrates RSU loop, runs ML, publishes events, sends ACK
- lora_handler: handles LoRa communication
- sim800_mqtt: SIM800L AT commands for MQTT and SMS alerts
- cms_comm: wraps MQTT publish
- storage_handler: SD logging
- ml_integration: wraps decision tree rules and returns severity + confidence
- decision_tree_rules: deterministic rule-based classifier