#include "gps.h"
#include <stdio.h>

void gps_init(void) {
    printf("GPS init.\n");
}

void gps_update(void) {
    // Poll UART for NMEA data
}

void gps_get_location(event_payload_t *ev) {
    ev->lat = 12.9716;
    ev->lon = 77.5946;
    ev->has_gps = 1;
}
