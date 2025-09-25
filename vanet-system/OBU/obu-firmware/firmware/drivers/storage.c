#include "../include/storage.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

static const char *STORE_DIR = "/tmp/obu_store";

int storage_init(void) {
    mkdir(STORE_DIR, 0755);
    return 0;
}

int storage_append_event(const event_meta_t *e, const void *payload, uint32_t payload_len) {
    char fname[512]; snprintf(fname,sizeof(fname), "%s/%s.meta", STORE_DIR, e->uuid);
    FILE *f = fopen(fname,"w"); if(!f) return -1;
    fwrite(e, sizeof(*e), 1, f); fclose(f);
    if (payload && payload_len>0) {
        char pfn[512]; snprintf(pfn,sizeof(pfn), "%s/%s.payload", STORE_DIR, e->uuid);
        FILE *pf = fopen(pfn,"wb"); if(pf){ fwrite(payload,1,payload_len,pf); fclose(pf); }
    }
    return 0;
}

int storage_get_pending(event_meta_t *out_array, int max) {
    // naive directory scan
    int found=0;
    struct stat st; char path[512];
    for (int i=0;i<max;i++) { out_array[i].status = EVT_ACKED; }
    // simplified: read files in STORE_DIR
    return 0;
}

int storage_mark_acked(const char *uuid) {
    char fname[512]; snprintf(fname,sizeof(fname), "%s/%s.meta", STORE_DIR, uuid);
    remove(fname);
    char pfn[512]; snprintf(pfn,sizeof(pfn), "%s/%s.payload", STORE_DIR, uuid); remove(pfn);
    return 0;
}

int storage_delete_old(int older_than_seconds) { return 0; }
