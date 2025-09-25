#include "../include/event.h"
#include "../include/imu.h"
#include "../include/gps.h"
#include "../include/lora.h"
#include "../include/storage.h"
#include <stdio.h>
#include <string.h>
#include <time.h>

// Thresholds (configurable via remote config)
static const float ACCEL_THRESHOLD_G = 8.0f; // m/s^2 -> ~0.8g, tune
static const int MAX_RETRIES = 8;

// Simple local UUID generator (replace with proper GUID generator)
static void gen_uuid(char *out) {
    snprintf(out, 37, "uuid-%lu", (unsigned long)time(NULL));
}

void event_manager_init(void) {
    storage_init();
    lora_init();
}

void event_manager_loop(void) {
    // 1) sample IMU
    imu_sample_t s;
    if (imu_read(&s) == 0) {
        float mag = s.ax*s.ax + s.ay*s.ay + s.az*s.az;
        if (mag > (ACCEL_THRESHOLD_G*ACCEL_THRESHOLD_G)) {
            // trigger
            event_meta_t ev; memset(&ev,0,sizeof(ev));
            gen_uuid(ev.uuid);
            ev.timestamp = (uint32_t)time(NULL);
            gps_fix_t g; if (gps_read(&g) == 0 && g.valid) { ev.lat = g.lat; ev.lon = g.lon; }
            ev.type = 1; ev.severity = 2; ev.retry_count = 0; ev.status = EVT_PENDING;
            // minimal payload: snapshot (could be pointer to FRAM/microSD)
            uint8_t payload[16]; // placeholder
            storage_append_event(&ev, payload, sizeof(payload));
            printf("[EVENT] created uuid=%s lat=%f lon=%f\n", ev.uuid, ev.lat, ev.lon);
        }
    }

    // 2) try to send pending events
    event_meta_t pending[8];
    int n = storage_get_pending(pending, 8);
    for (int i=0;i<n;i++) {
        event_meta_t *e = &pending[i];
        if (e->status == EVT_PENDING || e->status == EVT_SENT) {
            // build compact packet
            uint8_t pkt[64]; int len=0;
            // packet formation: [uuid(16) | ts(4) | lat(4) | lon(4) | type(1) | severity(1)]
            // for demo we store as text
            len = snprintf((char*)pkt, sizeof(pkt), "%s,%u,%.6f,%.6f,%d,%d", e->uuid, (unsigned)e->timestamp, e->lat, e->lon, e->type, e->severity);
            int rc = lora_send(pkt, len);
            if (rc == 0) {
                // mark as SENT and increase retry_count
                // In real system wait for RSU ACK; for now mark SENT and storage will track retries
                e->status = EVT_SENT;
                e->retry_count++;
                storage_append_event(e, NULL, 0); // update meta (simple append for demo)
                printf("[TX] sent uuid=%s\n", e->uuid);
            }
        }
    }

    // sleep / wait - in RTOS this would be a delay
}
