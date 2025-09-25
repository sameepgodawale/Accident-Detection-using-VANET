#!/usr/bin/env python3
import socket, json, uuid, time, argparse, random
parser=argparse.ArgumentParser()
parser.add_argument('--count',type=int,default=10)
args=parser.parse_args()
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
for i in range(args.count):
    ev={'event_uuid':str(uuid.uuid4()), 'device_id':'OBU-PROD-001', 'event_type':'CRASH', 'lat':17.385+random.random()/100, 'lon':78.486+random.random()/100, 'timestamp':time.strftime('%Y-%m-%dT%H:%M:%SZ')}
    sock.sendto(json.dumps(ev).encode(), ('127.0.0.1',17000))
    print('Sent', ev['event_uuid'])
    time.sleep(1)
