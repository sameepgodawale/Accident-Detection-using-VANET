#!/usr/bin/env python3
# Simple RSU emulator - receives UDP and prints, useful for testing forwarded messages
import socket, json
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
sock.bind(('0.0.0.0',17000))
print('RSU emulator listening on 17000')
while True:
    data,addr=sock.recvfrom(65536)
    try:
        j=json.loads(data.decode())
        print('[RSU EMU] event', j.get('event_uuid'), 'from', j.get('device_id'))
    except Exception as e:
        print('Bad',e)
