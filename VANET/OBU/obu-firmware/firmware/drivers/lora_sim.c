#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>

int lora_init(void){ return 0; }
int lora_send(const uint8_t *buf, uint8_t len){
    // send as UDP to localhost:17000 for RSU emulator during testing
    int sock = socket(AF_INET, SOCK_DGRAM, 0);
    struct sockaddr_in addr; addr.sin_family=AF_INET; addr.sin_port=htons(17000); addr.sin_addr.s_addr=inet_addr("127.0.0.1");
    sendto(sock, buf, len, 0, (struct sockaddr*)&addr, sizeof(addr));
    close(sock);
    return 0;
}
int lora_receive(uint8_t *buf, uint8_t maxlen){ return 0; }
