#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "ml_integration.h"

WiFiClient espClient;
PubSubClient client(espClient);

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  if (String(topic).endsWith("/config")) {
    Serial.println("[MQTT] Received config update");
    if (ml_update_from_json(message.c_str())) {
      Serial.println("[MQTT] Thresholds updated and saved to SD");
    } else {
      Serial.println("[MQTT] Failed to update thresholds");
    }
  }
}

void setup() {
  Serial.begin(115200);
  // WiFi + MQTT connect here ...
  client.setCallback(mqttCallback);
  ml_init(); // Load thresholds
}

void loop() {
  client.loop();
  // RSU main logic ...
}
