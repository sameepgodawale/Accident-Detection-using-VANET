pragma once
#include <stdint.h>
typedef struct{uint32_t id;uint8_t data[8];uint8_t len;} can_message_t; void canbus_init(void); int canbus_read(can_message_t*); void canbus_poll(void);
