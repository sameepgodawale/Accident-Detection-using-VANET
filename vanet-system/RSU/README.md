# RSU — Updated Package (HTTP parse, HMAC, Provisioning, Wiring diagram, Hardened uploader)

Generated: 2025-09-27T08:07:35.263164Z

This package updates the RSU firmware to include:
1. Proper parsing of SIM800L +HTTPACTION responses and HTTP status code handling.
2. HMAC-SHA256 signing of payloads using key provisioned on SD (or fallback to config.h).
3. Provisioning flow: API key stored in `/sd/provision.cfg` (plain text) and read at startup.
4. Wiring diagram (SVG) added for assembly technicians.
5. Hardened uploader: exponential backoff, severity-based prioritization, retry counts, OTA hook.

Follow docs/GETTING_STARTED.md to build, flash and test.
