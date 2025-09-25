#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include "imusim.h"
#include "event_store.h"
#include "transmit.h"
#include "relay_cache.h"

int main(){
    printf("OBU Host Simulation Starting...\n");
    imu_init();
    event_store_init("./data");
    transmit_init(17000, "127.0.0.1");
    relay_cache_init();

    for(int i=0;i<30;i++){
        imu_sample_t s = imu_get_sample();
        if(detect_crash(s)){
            char uuid[37]; generate_uuid(uuid);
            printf("[OBU] Detected crash, uuid=%s\n", uuid);
            event_t ev; memset(&ev,0,sizeof(ev));
            strncpy(ev.event_uuid, uuid, 36);
            ev.event_type = EVENT_CRASH;
            ev.lat = 17.385044 + (rand()%1000)/10000.0;
            ev.lon = 78.486671 + (rand()%1000)/10000.0;
            ev.timestamp = time(NULL);
            event_store_add(&ev);
        }
        transmit_loop_iteration();
        sleep(1);
    }
    printf("OBU Simulation Finished.\n");
    return 0;
}
