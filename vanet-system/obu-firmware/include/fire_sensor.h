pragma once
typedef struct{float temperature;float ir;float gas;} fire_sample_t; void fire_sensor_init(void); int fire_sensor_read(fire_sample_t*); void fire_sensor_poll(void);
