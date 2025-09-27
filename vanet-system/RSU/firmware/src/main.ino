/* RSU Updated Main - ESP32
 * - LoRa receive
 * - Append events to SD (/sd/events/*.json)
 * - Uploader task uses SIM800L to POST events to CMS
 * - Adds: HTTP status parsing, HMAC-SHA256, provisioning via SD, backoff & prioritization, OTA hook
 */

#include <Arduino.h>
#include "config.h"
#include <SPI.h>
#include <LoRa.h>
#include <HardwareSerial.h>
#include <SdFat.h>
#include "mbedtls/md.h"

HardwareSerial SIMSerial(2);
SdFat SD;

const char *EVT_DIR = "/events";
const char *PROV_FILE = "/provision.cfg";

String api_key = "";

void read_provisioning(){
  if(!SD.exists(PROV_FILE)){
    Serial.println("Provision file not found, using fallback API key");
    api_key = String(API_KEY_FALLBACK);
    return;
  }
  File f = SD.open(PROV_FILE, FILE_READ);
  if(!f){ api_key = String(API_KEY_FALLBACK); return; }
  api_key = f.readStringUntil('\n'); api_key.trim(); f.close();
  if(api_key.length()==0) api_key = String(API_KEY_FALLBACK);
  Serial.print("API key loaded: "); Serial.println(api_key);
}

String compute_hmac_hex(const String &key, const String &message){
  const mbedtls_md_info_t *info = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
  unsigned char output[32];
  mbedtls_md_hmac(info, (const unsigned char*)key.c_str(), key.length(), (const unsigned char*)message.c_str(), message.length(), output);
  // hex encode
  char hex[65];
  for(int i=0;i<32;i++) sprintf(hex + i*2, "%02x", output[i]);
  hex[64]=0;
  return String(hex);
}

void setupLoRa(){
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_NSS);
  LoRa.setPins(LORA_NSS, LORA_RST, LORA_DIO0);
  if(!LoRa.begin(LORA_FREQUENCY)){
    Serial.println("LoRa init failed"); while(1) delay(1000);
  }
  Serial.println("LoRa ready");
}

void setupSIM(){
  SIMSerial.begin(115200, SERIAL_8N1, SIM_RX_PIN, SIM_TX_PIN);
  pinMode(SIM_PWRKEY_PIN, OUTPUT); digitalWrite(SIM_PWRKEY_PIN, LOW); delay(100);
}

bool sd_init(){
  if(!SD.begin(SD_CS)){
    Serial.println("SD init failed"); return false;
  }
  Serial.println("SD ready");
  if(!SD.exists(EVT_DIR)) SD.mkdir(EVT_DIR);
  return true;
}

String gen_uuid(){ uint32_t t = millis(); char buf[32]; snprintf(buf,sizeof(buf),"%08lX", t); return String(buf); }

String readLoRaPacket(){ int packetSize = LoRa.parsePacket(); if(packetSize==0) return String(); String s=""; while(LoRa.available()) s += (char)LoRa.read(); return s; }

bool persist_event(const String &uuid, const String &json){ String fname = String(EVT_DIR) + "/evt_" + uuid + ".json"; File f = SD.open(fname.c_str(), FILE_WRITE); if(!f){ Serial.println("Failed open event file"); return false; } f.print(json); f.close(); Serial.print("Persisted: "); Serial.println(fname); return true; }

// parse severity from simple JSON: look for "severity":NUM or "severity":"TEXT"
int parse_severity_from_json(const String &json){ int sev = 0; int idx = json.indexOf("\"severity\""); if(idx<0) return 0; int colon = json.indexOf(':', idx); if(colon<0) return 0; int i = colon+1; while(i<json.length() && (json[i]==' '||json[i]=='\"')) i++; // read number
  String num=""; while(i<json.length() && isDigit(json[i])){ num += json[i]; i++; }
  if(num.length()) return num.toInt(); // else 0
}

// Helper: send AT cmd and wait for expected. Collect responses in resp_out
bool sim800_send_cmd(const char *cmd, const char *expect, unsigned long timeout, String *resp_out=nullptr){
  while(SIMSerial.available()) SIMSerial.read();
  SIMSerial.print(cmd); SIMSerial.print("\r\n");
  unsigned long start = millis(); String resp="";
  while(millis()-start < timeout){ while(SIMSerial.available()){ resp += (char)SIMSerial.read(); }
    if(expect && expect[0]){ if(resp.indexOf(expect) >= 0){ if(resp_out) *resp_out = resp; return true; } }
    else { if(resp.length()>0){ if(resp_out) *resp_out = resp; return true; } }
  }
  if(resp_out) *resp_out = resp;
  return false;
}

// Parse +HTTPACTION: <method>,<status>,<datalen>
int parse_httpaction_status(const String &resp){ int idx = resp.indexOf("+HTTPACTION:"); if(idx<0) return -1; int c = resp.indexOf(',', idx); if(c<0) return -1; int c2 = resp.indexOf(',', c+1); if(c2<0) return -1; String status = resp.substring(c+1, c2); status.trim(); return status.toInt(); }

// send HTTP POST but parse +HTTPACTION and return HTTP status (or -1)
int sim800_http_post_with_status(const String &url, const String &payload){
  String r;
  if(!sim800_send_cmd("AT", "OK", 1000, &r)) return -1;
  if(!sim800_send_cmd("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", "OK", 2000, &r)) return -1;
  String apnCmd = String("AT+SAPBR=3,1,\"APN\",\"") + SIM_APN + "\"";
  if(!sim800_send_cmd(apnCmd.c_str(), "OK", 2000, &r)) return -1;
  if(!sim800_send_cmd("AT+SAPBR=1,1", "OK", 15000, &r)) return -1;
  if(!sim800_send_cmd("AT+HTTPINIT", "OK", 2000, &r)) return -1;
  String para = String("AT+HTTPPARA=\"URL\",\"") + url + "\"";
  if(!sim800_send_cmd(para.c_str(), "OK", 2000, &r)) return -1;
  // set header for HMAC
  String hdr = String("AT+HTTPPARA=\"USERDATA\",\"X-HMAC-SHA256:\") + " "; // placeholder, USERDATA may not be supported
  // Some SIM800L do not support custom headers via HTTPPARA; instead embedding HMAC in payload or use server-side verification
  // We'll include HMAC in payload as top-level field if server expects it
  String dataCmd = String("AT+HTTPDATA=") + payload.length() + ",10000";
  if(!sim800_send_cmd(dataCmd.c_str(), "DOWNLOAD", 2000, &r)) return -1;
  SIMSerial.print(payload);
  delay(100);
  // send action
  if(!sim800_send_cmd("AT+HTTPACTION=1", "+HTTPACTION:", 20000, &r)){
    // sometimes we need to poll for +HTTPACTION
    delay(1000);
    String rr; sim800_send_cmd("AT+HTTPREAD", "", 2000, &rr);
    return -1;
  }
  int status = parse_httpaction_status(r);
  // terminate
  sim800_send_cmd("AT+HTTPTERM", "OK", 2000, &r);
  return status;
}

// Extract retry count from filename suffix .rN.json
int extract_retry_from_name(const String &name){ int rpos = name.lastIndexOf(".r"); if(rpos<0) return 0; int dot = name.indexOf('.', rpos+1); if(dot<0) dot = name.indexOf(".json", rpos+1); String num = name.substring(rpos+2, dot); return num.toInt(); }
String make_retry_name(const String &name, int retry){ // name like /events/evt_uuid.json
  int p = name.lastIndexOf(".json"); if(p<0) p = name.length(); String base = name.substring(0,p); return base + ".r" + String(retry) + ".json"; }

void ota_check_and_apply(){
  if(SD.exists("/ota.bin")){
    Serial.println("OTA file found on SD - placeholder apply");
    // In production implement secure ota: verify signature, write to partition, reboot
    SD.remove("/ota.bin");
    Serial.println("OTA file removed after placeholder apply");
  }
}

// uploader task with priority sorting and backoff
void uploader_task(void *pvParameters){ (void) pvParameters;
  while(1){
    ota_check_and_apply();
    // enumerate files
    File dir = SD.open(EVT_DIR);
    if(!dir){ vTaskDelay(pdMS_TO_TICKS(UPLOADER_INTERVAL_MS)); continue; }
    // collect candidate files
    struct FileRec{ String name; int severity; int retry; };
    std::vector<FileRec> files;
    File f = dir.openNextFile();
    while(f){ String name = String(f.name()); if(name.endsWith(".json")){
        // read payload quickly
        String payload=""; while(f.available()) payload += (char)f.read();
        int sev = parse_severity_from_json(payload);
        int retry = extract_retry_from_name(name);
        files.push_back({name, sev, retry});
      }
      f.close(); f = dir.openNextFile(); }
    dir.close();
    // sort by severity desc, retry asc
    std::sort(files.begin(), files.end(), [](const FileRec &a, const FileRec &b){ if(a.severity!=b.severity) return a.severity > b.severity; return a.retry < b.retry; });
    // process files
    for(auto &fr: files){ File ef = SD.open(fr.name.c_str(), FILE_READ); if(!ef) continue; String payload=""; while(ef.available()) payload += (char)ef.read(); ef.close();
      // compute HMAC and attach to payload as field
      String hmac = compute_hmac_hex(api_key, payload);
      String wrapped = payload;
      // naive wrapping: add field "hmac":"..." before final }
      int pos = wrapped.lastIndexOf('}'); if(pos>0){ String newp = wrapped.substring(0,pos) + ",\"hmac\":\"" + hmac + "\"}"; wrapped = newp; }
      Serial.print("Uploading "); Serial.println(fr.name);
      int status = sim800_http_post_with_status(String(CMS_URL), wrapped);
      if(status >=200 && status < 300){
        Serial.println("Upload success, removing"); SD.remove(fr.name.c_str());
      } else {
        Serial.print("Upload failed status="); Serial.println(status);
        int retry = fr.retry + 1;
        if(retry > MAX_RETRIES){ Serial.println("Max retries exceeded, moving to failed folder"); SD.rename(fr.name.c_str(), (String(EVT_DIR)+"/failed/"+fr.name.substring(fr.name.lastIndexOf('/')+1)).c_str()); }
        else {
          String newname = make_retry_name(fr.name, retry);
          SD.rename(fr.name.c_str(), newname.c_str());
          // exponential backoff delay proportional to retry
          unsigned long backoff = (1UL << retry) * 1000UL; if(backoff > 60000UL) backoff = 60000UL; vTaskDelay(pdMS_TO_TICKS(backoff));
        }
      }
    }
    vTaskDelay(pdMS_TO_TICKS(UPLOADER_INTERVAL_MS));
  }
}

void setup(){ Serial.begin(115200); delay(500); Serial.println("RSU Updated starting..."); setupLoRa(); setupSIM(); if(!sd_init()){ Serial.println("SD init failed - continuing"); }
  read_provisioning(); xTaskCreatePinnedToCore(uploader_task, "uploader", 16384, NULL, 1, NULL, 1);
}

void loop(){ String pkt = readLoRaPacket(); if(pkt.length()){ Serial.print("RX: "); Serial.println(pkt); String uuid = gen_uuid(); if(pkt.indexOf('{')>=0) persist_event(uuid, pkt); else Serial.println("Invalid packet"); }
  delay(10);
}
