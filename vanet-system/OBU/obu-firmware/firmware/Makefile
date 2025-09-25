# Simple host build for testing (not cross compile)
CC=gcc
CFLAGS=-Iinclude -Wall -O2
SRCS=core/event_manager.c drivers/storage.c drivers/lora_sim.c drivers/imu_sim.c drivers/gps_sim.c
all:
	mkdir -p bin
	$(CC) $(CFLAGS) -o bin/obu_sim $(SRCS)
clean:
	rm -f bin/obu_sim
