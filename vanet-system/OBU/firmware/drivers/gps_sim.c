#include "../include/gps.h"
#include <time.h>
int gps_read(gps_fix_t *f){ f->lat = 17.385044; f->lon = 78.486671; f->sats=8; f->valid=1; return 0; }
