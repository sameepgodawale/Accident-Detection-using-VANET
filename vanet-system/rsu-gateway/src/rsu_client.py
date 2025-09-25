#!/usr/bin/env python3
# rsu_client.py - listens on UDP for incoming OBU packets, decodes, enqueues for forward
import argparse, socket, json, time, threading, os
from decoder import decode_packet
from forwarder import RSUQueue, worker_loop

parser = argparse.ArgumentParser()
parser.add_argument('--bind','-b', default='0.0.0.0')
parser.add_argument('--port','-p', type=int, default=17000)
parser.add_argument('--target','-t', default='http://localhost:8080/backend/public/ingest.php')
parser.add_argument('--worker', action='store_true', help='run queue worker in this process')
args = parser.parse_args()

queue = RSUQueue()

def udp_listener(bind, port, target):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((bind, port))
    print(f'RSU UDP listener bound to {bind}:{port}, forwarding to {target}')
    while True:
        data, addr = sock.recvfrom(65536)
        try:
            pkt = decode_packet(data)
            # Enrich: add rsu_id, rssi and received_at
            pkt['rsu_id'] = os.environ.get('RSU_ID','RSU-SIM-01')
            pkt['rssi'] = -60
            pkt['received_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            # enqueue
            queue.enqueue(args.target, pkt)
            print('Enqueued event', pkt.get('event_uuid'))
        except Exception as e:
            print('Failed decode:', e)

if __name__ == '__main__':
    if args.worker:
        # run worker and listener in separate threads
        t_worker = threading.Thread(target=worker_loop, args=(queue,), daemon=True)
        t_worker.start()
        udp_listener(args.bind, args.port, args.target)
    else:
        udp_listener(args.bind, args.port, args.target)
