#!/usr/bin/env python3
import requests, uuid, random, time
from datetime import datetime

API_URL = "http://localhost/backend/public/ingest.php"  # Adjust if needed
API_KEY = "your_api_key_here"  # If using auth

def simulate_event():
    event = {
        "device_id": f"OBU-{random.randint(100,999)}",
        "event_uuid": str(uuid.uuid4()),
        "event_type": random.choice(["CRASH","FIRE"]),
        "severity": random.choice(["MINOR","MAJOR","CRITICAL"]),
        "timestamp": datetime.utcnow().isoformat(),
        "lat": round(20.0 + random.uniform(-5,5), 6),
        "lon": round(78.0 + random.uniform(-5,5), 6),
        "speed": random.randint(0,120),
        "heading": random.randint(0,359),
        "payload": {
            "acc_x": round(random.uniform(-5,5),2),
            "acc_y": round(random.uniform(-5,5),2)
        }
    }
    return event

if __name__ == "__main__":
    while True:
        ev = simulate_event()
        try:
            headers = {"Content-Type":"application/json"}
            if API_KEY:
                headers["X-API-KEY"] = API_KEY
            r = requests.post(API_URL, json=ev, headers=headers, timeout=5)
            print(f"Sent event {ev['event_uuid']} -> {r.status_code} {r.text}")
        except Exception as e:
            print("Error sending event:", e)
        time.sleep(10)
