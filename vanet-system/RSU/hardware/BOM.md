# RSU BOM (Cellular) - Example

Reference: Hardware List for Gateway Prototype provided by user. fileciteturn4file0

Core items:
- ESP32-WROOM-32 Dev Module
- SX1278 LoRa Module (matching your region frequency)
- SIM800L GSM/GPRS Module (with SMA antenna and strong power regulator)
- MicroSD card holder + 8GB microSD card (for buffering)
- DC-DC buck (12V -> 5V), LDO/regulator (4.0V) for SIM800L
- Level shifters (if needed) for UART between ESP32 (3.3V) and SIM800L
- Antennas: LoRa and GSM (external SMA)
- Connectors, enclosure, screws, vibration mounts

Notes on SIM800L power: SIM800L requires a low-impedance power source capable of high peak currents (~2A) during GSM transmit bursts. Use dedicated regulator and large decoupling capacitor (1000uF) on the SIM800L Vcc.
