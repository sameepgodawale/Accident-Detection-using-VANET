#!/usr/bin/env python3
import argparse, socket, threading, time, os
from decoder import decode
from forwarder import Queue, forward_to_cms

parser=argparse.ArgumentParser()
parser.add_argument('--listen-udp', type=int, default=17000)
parser.add_argument('--cms', type=str, required=True)
parser.add_argument('--api-key', type=str, default=None)
parser.add_argument('--worker', action='store_true')
args=parser.parse_args()

queue=Queue()

def udp_listener(port, cms_target):
    sock=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); sock.bind(('0.0.0.0', port))
    print('Listening UDP on',port)
    while True:
        data,addr=sock.recvfrom(65536)
        try:
            pkt=decode(data)
            pkt['rsu_id']=os.environ.get('RSU_ID','RSU-01')
            queue.enqueue(pkt)
            print('Enqueued', pkt.get('event_uuid'))
        except Exception as e:
            print('Decode error',e)

def worker_loop(target, api_key=None):
    while True:
        item=queue.pop_next()
        if not item:
            time.sleep(1); continue
        id,payload,attempts=item
        ok=forward_to_cms(payload, target, api_key)
        queue.mark(id, ok)
        print('Forwarded', id, 'ok=',ok)
        if not ok: time.sleep(0.5)

if __name__=='__main__':
    if args.worker:
        t=threading.Thread(target=worker_loop, args=(args.cms,args.api_key), daemon=True); t.start();
    udp_listener(args.listen_udp, args.cms)
