// src/components/EmergencyMap.tsx
// Leaflet map centered on India (Mumbai default).
// Renders a marker for each accident with colour by severity.

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { AccidentAlert } from "@/hooks/useAlerts";

// Leaflet is loaded via CDN — add to index.html if not already present:
//   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
//   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

declare const L: any;

interface Props {
  alerts: AccidentAlert[];
  selectedAlert?: AccidentAlert;
  onSelectAlert: (alert: AccidentAlert) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#E24B4A",
  MAJOR:    "#EF9F27",
  MINOR:    "#378ADD",
  UNKNOWN:  "#888780",
};

// Default center — Mumbai, India
const DEFAULT_LAT = 19.076;
const DEFAULT_LON = 72.877;
const DEFAULT_ZOOM = 11;

export function EmergencyMap({ alerts, selectedAlert, onSelectAlert }: Props) {
  const mapRef     = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const divRef     = useRef<HTMLDivElement>(null);

  // Initialise map once
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    mapRef.current = L.map(divRef.current, {
      center: [DEFAULT_LAT, DEFAULT_LON],
      zoom:   DEFAULT_ZOOM,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers whenever alerts change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    alerts.forEach(alert => {
      if (!alert.latitude || !alert.longitude) return;

      const color  = SEVERITY_COLOR[alert.severity] || SEVERITY_COLOR.UNKNOWN;
      const icon   = L.divIcon({
        className: "",
        html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 0 6px ${color}88;
        "></div>`,
        iconSize:   [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width:200px;font-family:sans-serif;font-size:13px">
            <b style="color:${color}">${alert.severity}</b>
            &nbsp;•&nbsp;${alert.status.toUpperCase()}<br/>
            <b>Vehicle:</b> ${alert.vehicleId || "Unknown"}<br/>
            <b>RSU:</b> ${alert.rsuId || "—"}<br/>
            ${alert.address
              ? `<b>Address:</b> ${alert.address}<br/>`
              : `<b>Lat/Lon:</b> ${alert.latitude.toFixed(5)}, ${alert.longitude.toFixed(5)}<br/>`
            }
            ${alert.eam?.acc != null
              ? `<b>Acc:</b> ${alert.eam.acc.toFixed(1)} m/s²
                 &nbsp;<b>Gyro:</b> ${alert.eam.gyro?.toFixed(0)}°/s<br/>`
              : ""
            }
            <b>Time:</b> ${new Date(alert.timestamp).toLocaleString()}<br/>
            <a href="https://maps.google.com/?q=${alert.latitude},${alert.longitude}"
               target="_blank" style="color:#378ADD">Open in Google Maps</a>
          </div>
        `)
        .on("click", () => onSelectAlert(alert));

      markersRef.current.push(marker);
    });

    // If there are alerts, fly to the most recent one
    if (alerts.length > 0) {
      const latest = alerts[0];
      if (latest.latitude && latest.longitude) {
        mapRef.current.flyTo([latest.latitude, latest.longitude], 13, {
          animate: true, duration: 1.5
        });
      }
    }
  }, [alerts, onSelectAlert]);

  // Pan to selected alert
  useEffect(() => {
    if (!mapRef.current || !selectedAlert?.latitude) return;
    mapRef.current.flyTo(
      [selectedAlert.latitude, selectedAlert.longitude], 15,
      { animate: true, duration: 1 }
    );
  }, [selectedAlert]);

  return (
    <div
      ref={divRef}
      style={{ width: "100%", height: "100%", minHeight: "400px" }}
    />
  );
}
