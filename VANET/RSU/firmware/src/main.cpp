#include <Arduino.h>
#include <ArduinoJson.h>
#include "lora_handler.h"
#include "sim800_mqtt.h"
#include "cms_comm.h"
#include "storage_handler.h"
#include "ml_integration.h"

#define RSU_ID "RSU-01"
#define MQTT_TOPIC "vanet/events"
#define ALERT_TOPIC "vanet/alerts"

void setup() {
  Serial.begin(115200);
  delay(1200);
  Serial.println("RSU (with ML) booting...");

  lora_init();
  storage_init();

  sim800_mqtt_init("internet", "broker.hivemq.com", 1883, "rsu-ml-001", "", "");

  ml_init();
  Serial.println("RSU ready.");
}

void loop() {
  String pkt = lora_receive();
  if (pkt.length() > 0) {
    Serial.println("[RX] " + pkt);
    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, pkt);
    if (err) {
      Serial.println("[ERR] invalid JSON");
      return;
    }
    float acc_delta = doc["features"]["acc_delta"] | doc["acc_delta"] | 0.0f;
    float gyro_delta = doc["features"]["gyro_delta"] | doc["gyro_delta"] | 0.0f;
    float vibration = doc["features"]["vibration"] | 0.0f;
    float impact_time = doc["features"]["impact_time"] | 0.0f;
    bool airbag = doc["features"]["airbag_deployed"] | doc["airbag_deployed"] | false;
    float wheel_drop = doc["features"]["wheel_speed_drop_pct"] | -1.0f;

    MlResult res = ml_classify(acc_delta, gyro_delta, vibration, impact_time, airbag, wheel_drop);

    doc["rsu_id"] = RSU_ID;
    doc["rsu_severity"] = res.label;
    doc["rsu_confidence"] = res.confidence;

    String out;
    serializeJson(doc, out);
    storage_log(out);
    bool pubok = sim800_mqtt_publish(MQTT_TOPIC, out);
    if (!pubok) Serial.println("[WARN] publish failed");
    else Serial.println("[INFO] published");

    const char *event_id = doc["event_id"] | "";
    StaticJsonDocument<256> ack;
    ack["ack"] = event_id;
    ack["rsu_id"] = RSU_ID;
    ack["rsu_severity"] = res.label;
    String ackStr;
    serializeJson(ack, ackStr);
    lora_send(ackStr);

    if (strcmp(res.label, "Critical") == 0) {
      StaticJsonDocument<256> alert;
      alert["event_id"] = event_id;
      alert["rsu_id"] = RSU_ID;
      alert["severity"] = res.label;
      alert["confidence"] = res.confidence;
      alert["lat"] = doc["lat"] | 0.0f;
      alert["lon"] = doc["lon"] | 0.0f;
      String alertStr;
      serializeJson(alert, alertStr);
      sim800_mqtt_publish(ALERT_TOPIC, alertStr);
      sim800_send_sms_alert("Emergency: critical crash detected.");
      Serial.println("[ALERT] critical alert sent.");
    }
  }
  delay(20);
}