import json

def decode(raw_bytes):
    # raw_bytes may be JSON text from OBU, or a defined binary format
    try:
        s = raw_bytes.decode('utf-8')
        j = json.loads(s)
        # basic normalization
        out = {
            'event_uuid': j.get('event_uuid'),
            'device_id': j.get('device_id'),
            'event_type': j.get('event_type'),
            'lat': float(j.get('lat',0)),
            'lon': float(j.get('lon',0)),
            'timestamp': j.get('timestamp')
        }
        return out
    except Exception as e:
        raise
