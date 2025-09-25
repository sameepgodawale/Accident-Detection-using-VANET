#pragma once
#include <stdint.h>
typedef struct { double lat, lon; int sats; int valid; } gps_fix_t;
void gps_init(void);
int gps_read(gps_fix_t*);
