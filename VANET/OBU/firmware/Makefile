CC=arm-none-eabi-gcc
CFLAGS=-mcpu=cortex-m4 -mthumb -Os -Iinclude

SRC=$(wildcard firmware/core/*.c firmware/drivers/*.c firmware/utils/*.c)
OBJ=$(SRC:.c=.o)

all: obu-firmware.elf

obu-firmware.elf: $(OBJ)
	$(CC) $(CFLAGS) -o $@ $^

clean:
	rm -f $(OBJ) obu-firmware.elf
