#!/usr/bin/env python3
import argparse, socket, json, time, uuid, random
parser=argparse.ArgumentParser()
parser.add_argument('--rsu-host', default='127.0.0.1')
parser.add_argument('--rsu-port', type=int, default=17000)
args=parser.parse_args()
sock=socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
for i in range(20):
    ev={'event_uuid': str(uuid.uuid4()), 'device_id': 'OBU-SIM-{:03d}'.format(i%4), 'event_type':'CRASH', 'lat':17.38+random.random()/10, 'lon':78.48+random.random()/10, 'timestamp':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
    sock.sendto(json.dumps(ev).encode(), (args.rsu_host, args.rsu_port))
    print('Sent', ev['event_uuid'])
    time.sleep(1)
