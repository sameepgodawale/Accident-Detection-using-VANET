#include "event_store.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

static char store_path[256];

void event_store_init(const char *path){ strncpy(store_path, path, sizeof(store_path)-1); mkdir(path, 0755); }

int event_store_add(event_t *e){ char fname[512]; snprintf(fname, sizeof(fname), "%s/%s.ev", store_path, e->event_uuid); FILE *f = fopen(fname, "w"); if(!f) return -1; fprintf(f, "%s,%d,%f,%f,%u,%d,%d\n", e->event_uuid, e->event_type, e->lat, e->lon, e->timestamp, e->status, e->retry_count); fclose(f); return 0; }

int event_store_get_pending(event_t **out_array, int max){ // naive scan
    return 0; }

void event_store_mark_acked(const char *uuid){ char fname[512]; snprintf(fname, sizeof(fname), "%s/%s.ev", store_path, uuid); remove(fname); }
