#!/usr/bin/env python3
# RSU emulator listens on UDP 17000 to mimic LoRa input for development/test
import socket, json
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
sock.bind(('0.0.0.0',17000))
print('RSU emulator listening on 17000')
while True:
    data,addr=sock.recvfrom(65536)
    try:
        j=json.loads(data.decode())
        print('[EMU] Received event', j.get('event_uuid'))
    except Exception as e:
        print('Bad packet', e)
