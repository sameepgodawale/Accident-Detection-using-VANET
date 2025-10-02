# Getting Started — RSU Updated

1. Extract ZIP, open firmware/ in PlatformIO
2. Insert SIM card (no PIN) and format microSD as FAT32
3. Optional: create /provision.cfg on SD with API key on first line
4. Edit config.h for CMS_URL and APN
5. Build & upload

Notes:
- The uploader now reads API key from /provision.cfg on SD and computes HMAC-SHA256 for payloads (attached as JSON field "hmac").
- OTA file: drop ota.bin at SD root to trigger placeholder OTA apply.
