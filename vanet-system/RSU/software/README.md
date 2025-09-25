# RSU Gateway Software (Python)

This is the main gateway that runs on an SBC (Raspberry Pi) or server. It receives packets (UDP or serial) from the LoRa frontend (ESP32 or concentrator), decodes packets, enqueues them in SQLite, and reliably forwards to CMS.

Main files:
- rsu_gateway.py: main process (listener + worker)
- decoder.py: packet validation and normalization
- forwarder.py: reliable HTTP forwarder with SQLite queue
- monitor.py: simple health check and metrics

Run:
  pip install -r requirements.txt
  python3 rsu_gateway.py --listen-udp 17000 --cms http://cms.example/api/ingest --worker

