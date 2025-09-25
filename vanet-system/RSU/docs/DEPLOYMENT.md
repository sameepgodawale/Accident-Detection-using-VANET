# Deployment Notes

Provisioning:
- Program RSU_ID and CMS API key in `config.h` or use a provisioning tool to write to SPIFFS/SD.
- Perform connectivity check (attach to GPRS APN) during provisioning.

Field operation:
- Mount antennas with 45cm separation; keep GSM antenna vertically polarized.
- Monitor SIM usage and replace SIM cards as part of maintenance.
- Use watchdog to reboot on failures and ensure queue DB integrity after power loss.
