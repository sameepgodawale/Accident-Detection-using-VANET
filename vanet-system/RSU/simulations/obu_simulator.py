#!/usr/bin/env python3
# Simulate OBU sending JSON packets to LoRa-like receiver.
# For testing with this RSU firmware, you can monitor serial or use a LoRa USB dongle.
import socket, json, uuid, time, random
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
for i in range(20):
    ev={'event_uuid':str(uuid.uuid4()), 'device_id':'OBU-SIM-001', 'event_type':'CRASH', 'lat':17.385+random.random()/100, 'lon':78.486+random.random()/100, 'timestamp':time.strftime('%Y-%m-%dT%H:%M:%SZ')}
    # send to localhost UDP 17000 - useful if using a local bridge
    sock.sendto(json.dumps(ev).encode(), ('127.0.0.1',17000))
    print('sent', ev['event_uuid'])
    time.sleep(1)
