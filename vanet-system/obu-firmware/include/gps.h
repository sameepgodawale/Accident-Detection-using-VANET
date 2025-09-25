pragma once
typedef struct{double lat,lon;int has_fix;} gps_fix_t; void gps_init(void); int gps_read(gps_fix_t*); void gps_poll(void);
