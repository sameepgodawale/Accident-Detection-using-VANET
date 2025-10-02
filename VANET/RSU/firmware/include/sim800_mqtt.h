#pragma once
#include <Arduino.h>

#ifndef SIM800_TX_PIN
#define SIM800_TX_PIN 27
#endif
#ifndef SIM800_RX_PIN
#define SIM800_RX_PIN 26
#endif

void sim800_mqtt_init(const char *apn, const char *broker, int port, const char *client_id, const char *user, const char *pass);
bool sim800_mqtt_publish(const char *topic, const String &payload);
void sim800_send_sms_alert(const String &msg);