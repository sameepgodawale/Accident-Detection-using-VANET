// web_cms/src/components/GoogleMapComponent.tsx

import React, { useCallback, useState } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { AccidentAlert } from '@/types/v2x'; 
import { AlertTriangle } from 'lucide-react';
import { getPath } from 'lucide-react/dist/esm/icons/alert-triangle'; 

interface GoogleMapProps {
  alerts: AccidentAlert[];
  selectedAlert: AccidentAlert | null;
  onSelectAlert: (alert: AccidentAlert | null) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultOptions = {
  panControl: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  clickableIcons: false,
  keyboardShortcuts: false,
  disableDoubleClickZoom: true,
  fullscreenControl: false,
};

// Helper function to calculate map bounds
const getBounds = (alerts: AccidentAlert[]) => {
  if (alerts.length === 0) return null;
  const bounds = new google.maps.LatLngBounds();
  alerts.forEach(alert => {
    bounds.extend({
      lat: alert.location.lat,
      lng: alert.location.lng,
    });
  });
  return bounds;
};

const GoogleMapComponent: React.FC<GoogleMapProps> = ({ 
  alerts, 
  selectedAlert, 
  onSelectAlert 
}) => {
  // Load API key from the frontend's environment variable
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
  });
  
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Recenter map when alerts change
  React.useEffect(() => {
    if (map && alerts.length > 0) {
      const bounds = getBounds(alerts);
      if (bounds) {
        map.fitBounds(bounds);
        if (alerts.length === 1) {
          map.setZoom(16);
        }
      }
    } else if (map) {
      // Default center if no alerts
      map.setCenter({ lat: 34.0522, lng: -118.2437 }); 
      map.setZoom(10);
    }
  }, [map, alerts]);

  if (loadError) return <div className="text-destructive text-center p-6">Error loading maps. Check API Key.</div>;
  if (!isLoaded) return <div className="text-primary text-center p-6 animate-pulse">Loading Map...</div>;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-xl border border-border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={alerts.length > 0 ? { lat: alerts[0].location.lat, lng: alerts[0].location.lng } : { lat: 34.0522, lng: -118.2437 }}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
      >
        {alerts.map((alert) => (
          <MarkerF
            key={alert.id}
            position={{ lat: alert.location.lat, lng: alert.location.lng }}
            onClick={() => onSelectAlert(alert)}
            icon={{
              path: getPath(AlertTriangle), 
              fillColor: alert.severity === 'critical' ? '#dc2626' : '#f59e0b',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: alert.severity === 'critical' ? 2.5 : 2,
            }}
          />
        ))}

        {selectedAlert && (
          <InfoWindowF
            position={{ lat: selectedAlert.location.lat, lng: selectedAlert.location.lng }}
            onCloseClick={() => onSelectAlert(null)} 
          >
            <div className="p-2 text-sm max-w-xs">
              <h4 className="font-bold text-lg mb-1">{selectedAlert.accidentId}</h4>
              <p className="text-muted-foreground">{selectedAlert.address}</p>
              <p className="mt-2 text-critical font-medium uppercase">{selectedAlert.severity} Alert</p>
              <p className="text-xs mt-1">Status: {selectedAlert.status}</p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
