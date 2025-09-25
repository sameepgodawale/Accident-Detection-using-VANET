import sqlite3, time, json, requests

DB='rsu_queue.db'
MAX_RETRIES=8
BACKOFF_BASE=2.0

class Queue:
    def __init__(self, dbpath=DB):
        self.conn = sqlite3.connect(dbpath, check_same_thread=False)
        self._ensure()
    def _ensure(self):
        c=self.conn.cursor(); c.execute('''CREATE TABLE IF NOT EXISTS q (id INTEGER PRIMARY KEY, payload TEXT, attempts INTEGER DEFAULT 0, last_try INTEGER DEFAULT 0)'''); self.conn.commit()
    def enqueue(self, payload):
        c=self.conn.cursor(); c.execute('INSERT INTO q(payload) VALUES (?)', (json.dumps(payload),)); self.conn.commit(); return c.lastrowid
    def pop_next(self):
        now=int(time.time()); c=self.conn.cursor(); rows=c.execute('SELECT id,payload,attempts,last_try FROM q ORDER BY id LIMIT 50').fetchall()
        for id,payload,attempts,last_try in rows:
            if attempts==0 or now - last_try >= min(BACKOFF_BASE*(1.8**attempts),300):
                return id,json.loads(payload),attempts
        return None
    def mark(self,id,success):
        c=self.conn.cursor()
        if success:
            c.execute('DELETE FROM q WHERE id=?',(id,))
        else:
            c.execute('UPDATE q SET attempts=attempts+1, last_try=? WHERE id=?',(int(time.time()),id))
        self.conn.commit()

def forward_to_cms(payload, target, api_key=None):
    headers={'Content-Type':'application/json'}
    if api_key: headers['X-API-KEY']=api_key
    try:
        r=requests.post(target, json=payload, headers=headers, timeout=6)
        return 200<=r.status_code<300
    except Exception:
        return False
