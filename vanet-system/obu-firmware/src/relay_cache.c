#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// simple in-memory dedupe cache for simulation
#define CACHE_SIZE 256
static char cache[CACHE_SIZE][37];

void relay_cache_init(void){ for(int i=0;i<CACHE_SIZE;i++) cache[i][0]='\0'; }

int relay_cache_seen(const char *uuid){ for(int i=0;i<CACHE_SIZE;i++) if(strcmp(cache[i], uuid)==0) return 1; return 0; }

void relay_cache_add(const char *uuid){ for(int i=0;i<CACHE_SIZE;i++) if(cache[i][0]=='\0'){ strncpy(cache[i], uuid, 36); return; } /* naive */ }
