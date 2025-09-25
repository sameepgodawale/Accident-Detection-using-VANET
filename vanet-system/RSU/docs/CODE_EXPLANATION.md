# RSU Code Explanation

Firmware (ESP32):
- main.ino: initializes LoRa and forwards received payloads over UDP to gateway. Replace LoRa.begin frequency to match deployment.

Software (Python):
- rsu_gateway.py: UDP listener that enqueues decoded packets into SQLite queue and (optionally) runs worker to forward to CMS.
- decoder.py: normalizes OBU payloads into canonical dicts for CMS.
- forwarder.py: persistent queue implementation (SQLite) with exponential backoff retries.

Data flow:
1) OBU sends LoRa packet (compact or JSON)
2) LoRa front-end (ESP32 or concentrator) receives packet and forwards to the gateway (UDP/serial)
3) rsu_gateway.py decodes and enqueues
4) worker forwards to CMS ingest endpoint with API key
5) CMS responds; successful forwards are removed from queue; failed ones are backoff-retried

Operational notes:
- Use systemd to daemonize rsu_gateway.py for production
- Configure RSU_ID and RSU_API_KEY in environment
