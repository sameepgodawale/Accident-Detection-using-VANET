#!/usr/bin/env python3
import socket,json,uuid,time
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
for i in range(5):
    ev={'event_uuid':str(uuid.uuid4()),'device_id':'OBU-REAL-001','event_type':'CRASH','lat':17.38,'lon':78.48,'timestamp':time.strftime('%Y-%m-%dT%H:%M:%SZ')}
    sock.sendto(json.dumps(ev).encode(),('127.0.0.1',17000))
    print('sent',ev['event_uuid'])
    time.sleep(1)
