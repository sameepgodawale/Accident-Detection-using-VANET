# decoder.py
# Decode OBU packets for the RSU emulator / gateway.
# Supports two formats:
#  - JSON (simulator mode)
#  - Compact binary (future) - placeholder to implement binary unpacking

import struct
import json
import time

def decode_json_packet(raw):
    """
    Validate and normalize JSON payload from OBU simulator.
    Returns a dict ready for CMS ingestion.
    """
    # Raw expected fields: event_uuid, device_id, event_type, lat, lon, timestamp, optional: speed, payload
    out = {}
    out['event_uuid'] = str(raw.get('event_uuid', '')).strip()
    out['device_id'] = str(raw.get('device_id', '')).strip()
    out['event_type'] = str(raw.get('event_type', 'CRASH')).upper()
    # Lat/lon: ensure floats
    try:
        out['lat'] = float(raw.get('lat', 0.0))
        out['lon'] = float(raw.get('lon', 0.0))
    except Exception:
        out['lat'] = 0.0; out['lon'] = 0.0
    out['timestamp'] = raw.get('timestamp') or time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    if 'speed' in raw:
        try:
            out['speed'] = float(raw['speed'])
        except Exception:
            out['speed'] = None
    out['payload'] = raw.get('payload', None)
    return out

def decode_packet(raw):
    """
    Generic decode wrapper: raw may be a dict (already parsed) or bytes.
    """
    if isinstance(raw, dict):
        return decode_json_packet(raw)
    # If bytes: attempt to parse as JSON text first
    try:
        s = raw.decode()
        j = json.loads(s)
        return decode_json_packet(j)
    except Exception:
        pass
    # Binary parsing placeholder (define your compact LoRa format and parse it here)
    # Example: return {'event_uuid':..., 'device_id':..., ...}
    raise ValueError("Unsupported packet format")
