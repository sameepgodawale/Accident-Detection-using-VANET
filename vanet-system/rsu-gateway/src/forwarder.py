# forwarder.py
# Reliable forwarder with local SQLite queue for persistent store across restarts.
# Uses 'requests' and an sqlite DB file to persist pending posts.

import sqlite3, json, time, requests, os
from typing import Optional

DB_PATH = os.environ.get('RSU_QUEUE_DB') or 'rsu_queue.db'
RETRY_BASE = 2.0
MAX_RETRIES = 8

class RSUQueue:
    def __init__(self, dbpath=DB_PATH):
        self.dbpath = dbpath
        self._ensure_db()

    def _ensure_db(self):
        self.conn = sqlite3.connect(self.dbpath, timeout=10, check_same_thread=False)
        c = self.conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at INTEGER,
                last_try INTEGER,
                attempts INTEGER,
                target TEXT,
                payload TEXT
            )
        """)
        self.conn.commit()

    def enqueue(self, target, payload_dict):
        payload = json.dumps(payload_dict, separators=(',',':'))
        now = int(time.time())
        c = self.conn.cursor()
        c.execute("INSERT INTO queue (created_at,last_try,attempts,target,payload) VALUES (?,?,?,?,?)",
                  (now, 0, 0, target, payload))
        self.conn.commit()
        return c.lastrowid

    def pop_next(self):
        """
        Return next eligible row (FIFO) that is due based on backoff, without deleting it.
        """
        now = int(time.time())
        c = self.conn.cursor()
        rows = c.execute("SELECT id,created_at,last_try,attempts,target,payload FROM queue ORDER BY id ASC LIMIT 50").fetchall()
        for row in rows:
            id_, created_at, last_try, attempts, target, payload = row
            # compute delay
            if attempts == 0:
                due = True
            else:
                wait = min(RETRY_BASE * (1.8 ** attempts), 300)
                due = (now - last_try) >= wait
            if due and attempts < MAX_RETRIES:
                return {
                    'id': id_, 'created_at': created_at, 'last_try': last_try,
                    'attempts': attempts, 'target': target, 'payload': json.loads(payload)
                }
            # if attempts >= MAX_RETRIES -> leave, could be pruned later
        return None

    def mark_attempt(self, id_, success: bool):
        c = self.conn.cursor()
        if success:
            c.execute("DELETE FROM queue WHERE id = ?", (id_,))
        else:
            now = int(time.time())
            c.execute("UPDATE queue SET last_try = ?, attempts = attempts + 1 WHERE id = ?", (now, id_))
        self.conn.commit()

    def stats(self):
        c = self.conn.cursor()
        total = c.execute("SELECT COUNT(*) FROM queue").fetchone()[0]
        return {'pending': total}

def forward_http(target: str, payload: dict, timeout=6.0) -> bool:
    """
    Send HTTP POST with JSON; return True on 2xx; raise on permanent errors?
    """
    headers = {'Content-Type':'application/json', 'X-API-KEY': os.environ.get('RSU_API_KEY','RSU_KEY_EXAMPLE')}
    try:
        r = requests.post(target, json=payload, headers=headers, timeout=timeout)
        return 200 <= r.status_code < 300
    except requests.RequestException:
        return False

# Background worker example for queue flush
def worker_loop(queue: RSUQueue, poll_interval=1.0):
    while True:
        item = queue.pop_next()
        if not item:
            time.sleep(poll_interval)
            continue
        id_ = item['id']
        target = item['target']
        payload = item['payload']
        success = forward_http(target, payload)
        queue.mark_attempt(id_, success)
        if not success:
            # small sleep to avoid tight loop on failure
            time.sleep(0.5)
