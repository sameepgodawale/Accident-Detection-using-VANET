CC=gcc
CFLAGS=-Wall -O2 -DHOST_BUILD
SRCS=src/main.c src/imusim.c src/event_store.c src/transmit.c src/relay_cache.c
TARGET=obu_sim

all: $(TARGET)

$(TARGET): $(SRCS)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRCS)

clean:
	rm -f $(TARGET) *.o
