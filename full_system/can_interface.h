// src/device_code/can_interface.h

#pragma once
#include "event.h"

void can_init(void);

/**
 * @brief Polls the CAN bus for vehicle speed, and specifically the airbag status.
 */
void read_can_bus_data(event_payload_t *payload);
