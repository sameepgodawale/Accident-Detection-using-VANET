# RSU Bill of Materials (BOM) & Component Rationale

This BOM is based on the provided Gateway Hardware List (Hardware List for Gateway Prototype). fileciteturn4file0

Core components:
- ESP32 WROOM-32 dev board (1)
  - Reason: low-cost, dual-UART, SPI and Wi-Fi; can run LoRa client for simple deployments.

- LoRa SX1278 module + antenna (1)
  - Reason: selected to match OBU LoRa frequency (433/868/915 MHz). Good packet sensitivity and community support.

- SIM800L GSM/GPRS module + GSM antenna (1)
  - Reason: provides cellular fallback for gateways lacking wired backhaul. Requires careful power design (4V, 2A peak).

- MicroSD module + 8GB card (1)
  - Reason: robust local buffer for queued events when CMS unreachable.

- Power stage: 12V->5V buck, 5V->3.3V LDO, dedicated 4.0V regulator for SIM800L
  - Reason: provide stable, low-noise power for RF modules and handle SIM800L surge.

- RTC DS3231 (optional)
  - For offline accurate timestamps when GPS is not present on RSU.

- Enclosure, antennas, connectors, mounting hardware

Estimated cost (prototype): ~₹3,400–₹3,900 per gateway. See detailed hardware list file for pricing breakdown. fileciteturn4file0
