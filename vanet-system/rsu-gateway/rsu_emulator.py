#!/usr/bin/env python3
import argparse, socket, json, requests, time

parser = argparse.ArgumentParser()
parser.add_argument('--bind', default='0.0.0.0')
parser.add_argument('--port', type=int, default=17000)
parser.add_argument('--target', default='http://localhost:8080/backend/public/ingest.php')
args = parser.parse_args()

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((args.bind, args.port))
print('RSU Emulator listening on %s:%d' % (args.bind, args.port))

while True:
    data, addr = sock.recvfrom(4096)
    try:
        ev = json.loads(data.decode())
        print('[RSU] Received event', ev.get('event_uuid'))
        ev['rsu_id'] = 'RSU-SIM-01'
        ev['rssi'] = -60
        ev['received_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        # forward
        r = requests.post(args.target, json=ev, timeout=5)
        print('[RSU] Forwarded to CMS, status', r.status_code)
    except Exception as e:
        print('[RSU] Error processing packet:', e)
