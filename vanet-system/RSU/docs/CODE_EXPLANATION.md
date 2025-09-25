# RSU Firmware Code Explanation (Cellular)

Files of interest:
- src/main.ino: top-level loop. Receives LoRa packets; calls sim800_http_post to send to CMS.
- src/sim800_handler.cpp / .h: contains helper functions to interact with SIM800L over UART and execute AT commands.
- src/queue_manager.cpp: buffer/persistence abstraction (recommend replacing with SD or LittleFS for production).
- src/config.h: set CMS URL, SIM APN, RSU_ID and pin mapping.

Design notes:
- The firmware assumes OBU sends JSON over LoRa. If OBUs use compact binary, add binary->JSON conversion in main.ino.
- All outgoing HTTP posts are performed synchronously via SIM800L commands; for higher throughput, use asynchronous queue with worker task.

Testing & simulation:
- Use the `simulations/` tools to verify message formats and CMS endpoint behavior.
- Use an USB-to-UART adapter to connect to ESP32 serial for logs during testing.
