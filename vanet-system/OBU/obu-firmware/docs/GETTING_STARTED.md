# Getting Started — Build, Flash, and Test OBU (Quickstart)

Prereqs:
- arm-none-eabi-gcc toolchain (ARM Cortex-M)
- OpenOCD (or ST-Link CLI) for flashing
- Make, CMake (optional)
- Python 3.8+ for simulation tools

1) Build firmware (host):
   cd firmware
   make all
   # produces firmware/obj/firmware.elf and firmware/bin/firmware.bin

2) Flash to board (example using OpenOCD):
   openocd -f interface/stlink.cfg -f target/stm32f4x.cfg -c "program firmware/bin/firmware.bin verify reset exit"

3) Run VANET simulation with RSU emulator:
   cd simulations
   python3 run_rsu.py &
   python3 obu_simulator.py --count 20

4) Verify: CMS (if running) will receive events via RSU, or inspect RSU logs.

For full production testing, follow `docs/QA_TEST_PLAN.md`.
