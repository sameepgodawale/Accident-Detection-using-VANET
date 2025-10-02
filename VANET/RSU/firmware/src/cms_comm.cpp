#include "cms_comm.h"
#include "sim800_mqtt.h"

bool cms_send_to_server(const String &json) {
  return sim800_mqtt_publish("vanet/events", json);
}