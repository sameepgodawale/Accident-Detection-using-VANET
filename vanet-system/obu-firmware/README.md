# OBU Firmware Skeleton (Host-simulated)

This folder contains a simulation-friendly FreeRTOS-style C skeleton that implements:
- IMU sample generator (simulated)
- Crash detection stub
- Persistent event metadata store (simulated FRAM using files)
- Transmit scheduler with exponential backoff
- Local relay dedupe cache logic (in-memory for simulation)

How to build (host-mode):
- Run `make` inside this folder (uses gcc for host simulation build)

Note: This skeleton is intentionally portable and intended to be used as a reference for firmware implementation on STM32.
