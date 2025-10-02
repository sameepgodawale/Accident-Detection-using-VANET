/* main.ino - RSU firmware (full)
   - LoRa receive OBU JSON events
   - Local classification via decision_tree_rules.h
   - Persist enriched events to microSD (/events)
   - Upload to CMS via SIM800L HTTP POST (AT commands), parse +HTTPACTION for status
   - HMAC-SHA256 signing of payload using key from /provision.cfg on SD (optional)
   - Exponential backoff, retry counting (.rN.json), failed folder
   - Uses ArduinoJson, SdFat, LoRa, mbedTLS
*/

#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include <SdFat.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>
#include "decision_tree_rules.h"   // must be provided in src/
#include "config.h"               // CMS_URL, APN, pins defined here
#include <mbedtls/md.h>

//
// CONFIGURATION (from config.h)
//   CMS_URL, SIM_APN, LORA pins, SD_CS, SIM pins, UPLOADER_INTERVAL_MS, MAX_RETRIES, API_KEY_FALLBACK
//

// Globals
HardwareSerial SIMSerial(2);        // Serial2: RX2/TX2 pins from config.h
SdFat SD;
const char *EVT_DIR = "/events";
const char *FAILED_DIR = "/events/failed";
const char *PROV_FILE = "/provision.cfg";
String api_key;                     // HMAC key loaded from SD or fallback

// Upload control
const uint32_t UPLOADER_INTERVAL_DEFAULT = UPLOADER_INTERVAL_MS;
const int MAX_RETRY_DEFAULT = MAX_RETRIES;

// LoRa helper
void setupLoRa() {
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_NSS);
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);
  if (!LoRa.begin(LORA_FREQUENCY)) {
    Serial.println("LoRa init failed!");
    // handle error appropriately (blink LED / halt / retry)
    while (true) { delay(1000); }
  }
  Serial.println("LoRa ready");
}

// SIM800L helper: send AT command and wait for expected substring in response
bool sim_send_cmd_expect(const char *cmd, const char *expect, unsigned long timeout_ms, String *resp_out = nullptr) {
  while (SIMSerial.available()) SIMSerial.read(); // flush
  SIMSerial.print(cmd);
  SIMSerial.print("\r\n");
  unsigned long tstart = millis();
  String resp = "";
  while (millis() - tstart < timeout_ms) {
    while (SIMSerial.available()) {
      char c = (char)SIMSerial.read();
      resp += c;
    }
    if (expect == nullptr || expect[0] == '\0') {
      if (resp.length() > 0) {
        if (resp_out) *resp_out = resp;
        return true;
      }
    } else {
      if (resp.indexOf(expect) >= 0) {
        if (resp_out) *resp_out = resp;
        return true;
      }
    }
    delay(10);
  }
  if (resp_out) *resp_out = resp;
  return false;
}

// Parse +HTTPACTION response to extract status code; returns -1 on failure
int parse_httpaction_status(const String &resp) {
  int idx = resp.indexOf("+HTTPACTION:");
  if (idx < 0) return -1;
  // format usually: +HTTPACTION: <method>,<status>,<datalen>
  int firstComma = resp.indexOf(',', idx);
  if (firstComma < 0) return -1;
  int secondComma = resp.indexOf(',', firstComma + 1);
  if (secondComma < 0) return -1;
  String statusStr = resp.substring(firstComma + 1, secondComma);
  statusStr.trim();
  return statusStr.toInt();
}

// HMAC-SHA256 (mbedTLS) -> hex string
String compute_hmac_hex(const String &key, const String &message) {
  const mbedtls_md_info_t *info = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
  unsigned char out[32];
  mbedtls_md_hmac(info, (const unsigned char *)key.c_str(), key.length(), (const unsigned char *)message.c_str(), message.length(), out);
  char hexbuf[65];
  for (int i = 0; i < 32; ++i) {
    sprintf(hexbuf + i*2, "%02x", out[i]);
  }
  hexbuf[64] = 0;
  return String(hexbuf);
}

// SIM800L HTTP POST with proper +HTTPACTION parsing
// Returns HTTP status code (e.g., 200) on success, or -1 on failure
int sim800_http_post_with_status(const String &url, const String &payload, unsigned long total_timeout_ms = 30000) {
  String r;
  // Basic sequence with conservative timeouts; tuned for common SIM800L
  if (!sim_send_cmd_expect("AT", "OK", 1000, &r)) { Serial.println("SIM no AT"); return -1; }
  if (!sim_send_cmd_expect("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", "OK", 2000, &r)) { Serial.println("SAPBR set failed"); return -1; }
  String apnCmd = String("AT+SAPBR=3,1,\"APN\",\"") + SIM_APN + "\"";
  if (!sim_send_cmd_expect(apnCmd.c_str(), "OK", 2000, &r)) { Serial.println("APN set failed"); return -1; }
  if (!sim_send_cmd_expect("AT+SAPBR=1,1", "OK", 15000, &r)) { Serial.println("SAPBR open failed"); return -1; }
  if (!sim_send_cmd_expect("AT+HTTPINIT", "OK", 2000, &r)) { Serial.println("HTTPINIT failed"); /* try to continue */ }
  String para = String("AT+HTTPPARA=\"URL\",\"") + url + "\"";
  if (!sim_send_cmd_expect(para.c_str(), "OK", 2000, &r)) { Serial.println("HTTPPARA URL failed"); return -1; }
  // Content-Type - some modems accept header via HTTPPARA, otherwise include in payload or server handles
  sim_send_cmd_expect("AT+HTTPPARA=\"CONTENT\",\"application/json\"", "OK", 2000, &r);
  // Send data
  String dataCmd = String("AT+HTTPDATA=") + payload.length() + ",10000";
  if (!sim_send_cmd_expect(dataCmd.c_str(), "DOWNLOAD", 5000, &r)) { Serial.println("HTTPDATA DOWNLOAD not ready"); return -1; }
  // write payload
  SIMSerial.print(payload);
  delay(100); // give time to buffer
  // Action
  if (!sim_send_cmd_expect("AT+HTTPACTION=1", "+HTTPACTION:", total_timeout_ms, &r)) {
    // Try to poll for HTTPACTION if not immediate
    unsigned long start = millis();
    String pollResp = "";
    while (millis() - start < total_timeout_ms) {
      sim_send_cmd_expect("AT+HTTPSTATUS", "", 2000, &pollResp);
      if (pollResp.indexOf("+HTTPACTION:") >= 0) { r = pollResp; break; }
      delay(500);
    }
    if (r.indexOf("+HTTPACTION:") < 0) {
      Serial.println("HTTPACTION not received");
      sim_send_cmd_expect("AT+HTTPTERM", "OK", 2000, &r);
      return -1;
    }
  }
  int status = parse_httpaction_status(r);
  // Terminate
  sim_send_cmd_expect("AT+HTTPTERM", "OK", 2000, &r);
  return status; // may be -1 if parsing failed
}

// File helper: write JSON atomically by writing to tmp then renaming
bool sd_write_atomic(const char *tmpPath, const char *finalPath, const String &content) {
  File f = SD.open(tmpPath, FILE_WRITE);
  if (!f) return false;
  f.print(content);
  f.close();
  // rename (SdFat rename works)
  if (SD.exists(finalPath)) SD.remove(finalPath);
  return SD.rename(tmpPath, finalPath);
}

// Read provisioning API key from SD provision.cfg (first line)
void load_provisioning() {
  api_key = String(API_KEY_FALLBACK);
  if (!SD.exists(PROV_FILE)) {
    Serial.println("Provision file not found, using fallback API key");
    return;
  }
  File f = SD.open(PROV_FILE, FILE_READ);
  if (!f) {
    Serial.println("Provision file open failed");
    return;
  }
  String line = f.readStringUntil('\n');
  line.trim();
  f.close();
  if (line.length() > 0) api_key = line;
  Serial.println("API key loaded from SD (length): " + String(api_key.length()));
}

// Generate small UUID-like ID (not RFC uuid but ok for filenames)
String gen_uuid() {
  uint32_t t = millis();
  char buf[32];
  snprintf(buf, sizeof(buf), "%08lX", t ^ ((uint32_t)random()));
  return String(buf);
}

// Extract severity numeric or convert string to priority value for sorting
int severity_priority(const String &sev) {
  if (sev.equalsIgnoreCase("Critical")) return 3;
  if (sev.equalsIgnoreCase("Major")) return 2;
  if (sev.equalsIgnoreCase("Minor")) return 1;
  return 0;
}

// Helper to make retry filename: /events/evt_UUID.rN.json
String make_retry_name(const String &path, int retry) {
  int p = path.lastIndexOf(".json");
  String base = (p >= 0) ? path.substring(0, p) : path;
  return base + ".r" + String(retry) + ".json";
}

// Uploader task: scans /events, sorts by severity desc, retry asc, uploads to CMS, handles retries & backoff
void uploader_task(void *pvParameters) {
  (void)pvParameters;
  while (true) {
    // Ensure failed folder exists
    if (!SD.exists(FAILED_DIR)) SD.mkdir(FAILED_DIR);
    // Collect candidates
    File dir = SD.open(EVT_DIR);
    if (!dir) {
      Serial.println("Unable to open events dir");
      vTaskDelay(pdMS_TO_TICKS(UPLOADER_INTERVAL_DEFAULT));
      continue;
    }
    struct Entry { String path; int priority; int retry; };
    std::vector<Entry> entries;
    File file = dir.openNextFile();
    while (file) {
      String name = String(file.name());
      // only consider .json files (skip tmp or hidden)
      if (name.endsWith(".json")) {
        // read small header to find severity and retry count
        String content = "";
        while (file.available() && content.length() < 8192) content += (char)file.read();
        // parse JSON
        DynamicJsonDocument doc(8192);
        DeserializationError err = deserializeJson(doc, content);
        String sev = "Minor";
        if (!err) {
          if (doc.containsKey("rsu_severity")) sev = String((const char*)doc["rsu_severity"]);
          else if (doc.containsKey("severity")) sev = String((const char*)doc["severity"]);
        }
        // extract retry count from filename suffix .rN.json
        int retry = 0;
        int rpos = name.lastIndexOf(".r");
        if (rpos >= 0) {
          int p2 = name.indexOf(".json", rpos);
          if (p2 > rpos) {
            String rn = name.substring(rpos + 2, p2);
            retry = rn.toInt();
          }
        }
        entries.push_back({ name, severity_priority(sev), retry });
      }
      file.close();
      file = dir.openNextFile();
    }
    dir.close();
    // sort: severity desc, retry asc
    std::sort(entries.begin(), entries.end(), [](const Entry &a, const Entry &b) {
      if (a.priority != b.priority) return a.priority > b.priority;
      return a.retry < b.retry;
    });
    // process entries
    for (auto &e : entries) {
      // read full file
      File ef = SD.open(e.path.c_str(), FILE_READ);
      if (!ef) continue;
      String content = "";
      while (ef.available()) content += (char)ef.read();
      ef.close();
      // compute HMAC and attach if api_key present
      String hmac = "";
      if (api_key.length() > 0) {
        hmac = compute_hmac_hex(api_key, content);
        // attach as "hmac" field if JSON
        DynamicJsonDocument doc(16384);
        if (deserializeJson(doc, content) == DeserializationError::Ok) {
          doc["hmac"] = hmac;
          String out;
          serializeJson(doc, out);
          content = out;
        } else {
          // not JSON, wrap in object
          DynamicJsonDocument wrap(16384);
          wrap["payload"] = content;
          wrap["hmac"] = hmac;
          String out;
          serializeJson(wrap, out);
          content = out;
        }
      }
      // attempt upload
      Serial.println("Uploading: " + e.path);
      int http_status = sim800_http_post_with_status(String(CMS_URL), content);
      Serial.println("HTTP status: " + String(http_status));
      if (http_status >= 200 && http_status < 300) {
        // success; remove file
        SD.remove(e.path.c_str());
        Serial.println("Upload success, removed " + e.path);
      } else {
        // failure: increment retry or move to failed
        int nextRetry = e.retry + 1;
        if (nextRetry > MAX_RETRY_DEFAULT) {
          // move to failed folder
          String dest = String(FAILED_DIR) + "/" + e.path.substring(e.path.lastIndexOf('/') + 1);
          SD.rename(e.path.c_str(), dest.c_str());
          Serial.println("Max retries exceeded; moved to failed: " + dest);
        } else {
          String newName = make_retry_name(e.path, nextRetry);
          SD.rename(e.path.c_str(), newName.c_str());
          // backoff proportional to 2^retry seconds, cap at 60s
          unsigned long backoffMs = (1UL << nextRetry) * 1000UL;
          if (backoffMs > 60000UL) backoffMs = 60000UL;
          Serial.println("Upload failed; renamed to " + newName + " backoff " + String(backoffMs) + "ms");
          vTaskDelay(pdMS_TO_TICKS(backoffMs));
        }
      }
      // small delay between files
      vTaskDelay(pdMS_TO_TICKS(500));
    }
    // sleep until next scan
    vTaskDelay(pdMS_TO_TICKS(UPLOADER_INTERVAL_DEFAULT));
  } // end while
}

// Persist event JSON to SD with enrichment (atomic)
bool persist_event_json(const String &jsonPayload, String &outPath) {
  String uuid = gen_uuid();
  String tmp = String(EVT_DIR) + "/evt_" + uuid + ".tmp";
  String finalp = String(EVT_DIR) + "/evt_" + uuid + ".json";
  if (!sd_write_atomic(tmp.c_str(), finalp.c_str(), jsonPayload)) {
    Serial.println("Persist failed for " + finalp);
    return false;
  }
  outPath = finalp;
  return true;
}

// read LoRa packet and return string
String readLoRaPacket() {
  int packetSize = LoRa.parsePacket();
  if (packetSize == 0) return String();
  String s = "";
  while (LoRa.available()) s += (char)LoRa.read();
  return s;
}

void setupSIMSerial() {
  SIMSerial.begin(115200, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  pinMode(SIM_PWRKEY_PIN, OUTPUT);
  digitalWrite(SIM_PWRKEY_PIN, LOW);
}

// On startup: init LoRa, SD, SIM, load provisioning, create directories, start uploader task
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("RSU starting...");
  randomSeed(analogRead(0));
  setupLoRa();
  setupSIMSerial();
  if (!SD.begin(SD_CS)) {
    Serial.println("SD init failed - continuing without SD (not recommended)");
  } else {
    Serial.println("SD ready");
    if (!SD.exists(EVT_DIR)) SD.mkdir(EVT_DIR);
    if (!SD.exists(FAILED_DIR)) SD.mkdir(FAILED_DIR);
    load_provisioning();
  }
  // start uploader task pinned to core 1
  xTaskCreatePinnedToCore(uploader_task, "uploader", 16 * 1024, NULL, 1, NULL, 1);
  Serial.println("Setup complete");
}

// Main loop: receive LoRa packets, parse JSON, enrich with RSU severity and write to SD (uploader will pick it up)
void loop() {
  String pkt = readLoRaPacket();
  if (pkt.length()) {
    Serial.println("RX pkt: ");
    Serial.println(pkt);
    // Parse JSON robustly
    DynamicJsonDocument doc(16384);
    DeserializationError err = deserializeJson(doc, pkt);
    if (err) {
      Serial.println("Invalid JSON received; ignoring");
      return;
    }
    // Extract features safely with defaults
    float acc_delta = doc.containsKey("acc_delta") ? doc["acc_delta"].as<float>() : 0.0f;
    float gyro_delta = doc.containsKey("gyro_delta") ? doc["gyro_delta"].as<float>() : 0.0f;
    float vibration = doc.containsKey("vibration") ? doc["vibration"].as<float>() : 0.0f;
    float impact_time = doc.containsKey("impact_time") ? doc["impact_time"].as<float>() : 0.0f;
    bool airbag = doc.containsKey("airbag_deployed") ? doc["airbag_deployed"].as<bool>() : false;
    float wheel_drop = doc.containsKey("wheel_speed_drop_pct") ? doc["wheel_speed_drop_pct"].as<float>() : -1.0f;
    // local classification via decision_tree_rules.h
    String rsu_sev = classifySeverity(acc_delta, gyro_delta, vibration, impact_time, airbag, wheel_drop);
    // attach rsu_severity
    doc["rsu_severity"] = rsu_sev.c_str();
    // optionally, attach a timestamp if not present
    if (!doc.containsKey("timestamp")) doc["timestamp"] = String((unsigned long)(time(nullptr))).c_str();
    // Serialize enriched JSON
    String out;
    serializeJson(doc, out);
    // Persist to SD
    String savedPath;
    if (SD.begin(SD_CS)) {
      if (persist_event_json(out, savedPath)) {
        Serial.println("Persisted event: " + savedPath);
      } else {
        Serial.println("Failed to persist event");
      }
    } else {
      Serial.println("SD not available; skipping persist (not recommended)");
    }
    // If RSU decided Critical -> send immediate alert (minimal payload)
    if (rsu_sev.equalsIgnoreCase("Critical")) {
      // Build alert JSON
      DynamicJsonDocument alertDoc(1024);
      alertDoc["alert"] = "Critical crash";
      alertDoc["rsu_file"] = savedPath;
      alertDoc["device"] = "RSU";
      String alertStr; serializeJson(alertDoc, alertStr);
      // attempt a short HTTP POST with shorter timeout
      int st = sim800_http_post_with_status(String(CMS_URL), alertStr, 20000);
      Serial.println("Immediate alert HTTP status: " + String(st));
    }
  } // end if pkt
  delay(20);
}
