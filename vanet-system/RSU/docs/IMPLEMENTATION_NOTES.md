# Implementation Notes for Updates

1) HTTP parsing: sim800_http_post_with_status now listens for +HTTPACTION response and extracts HTTP status code. Only 2xx is treated as success.
2) HMAC: uses mbedTLS HMAC-SHA256 via mbedtls_md_hmac. This is available on ESP32 Arduino core. The HMAC is added as a "hmac" field into JSON payload before POST.
3) Provisioning: /provision.cfg on SD (first line) contains API key. If absent, fallback to API_KEY_FALLBACK in config.h.
4) Backoff & priority: Uploader scans events, parses severity from JSON, sorts files by severity desc then retry asc. On failure increments retry count by renaming file with .rN.json suffix and backs off exponentially.
5) OTA hook: placeholder. In production implement secure verify and partition write.

Security note: storing API key plaintext on SD is simple for testing. For production, use secure element and encrypted storage.
