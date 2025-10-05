// web_cms/src/pages/LiveMap.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; 
// import { LeafletMap } from '@/components/LeafletMap'; // Removed
import GoogleMapComponent from '@/components/GoogleMapComponent'; // Updated Import
import { AccidentAlert, IncidentLog } from '@/types/v2x';
import { fetchIncidents } from '@/services/api'; 

const LiveMap = () => {
  // --- REAL-TIME DATA FETCH ---
  const { 
    data: alerts = [], 
    isLoading: alertsLoading, 
    error 
  } = useQuery<IncidentLog[]>({
    queryKey: ['activeMapAlerts'], 
    // Fetch only pending/acknowledged alerts for map visibility
    queryFn: () => fetchIncidents('pending,acknowledged'), 
    refetchInterval: 5000, 
  });
  // ----------------------------

  const [selectedAlert, setSelectedAlert] = useState<AccidentAlert | null>(null);

  const safeAlerts = alerts as AccidentAlert[]; 

  return (
    <div className="h-screen w-full">
      <div className="h-16 border-b border-border bg-card/50 px-6 flex items-center">
        <h1 className="text-2xl font-bold">Live Map View (Google Maps)</h1>
        <div className="ml-auto text-sm text-muted-foreground">
          {alertsLoading ? (
            <span className="text-warning animate-pulse">Loading...</span>
          ) : error ? (
            <span className="text-destructive">Map Data Offline</span>
          ) : (
            <>
              <span className="font-bold">{safeAlerts.length}</span> Active Incidents
            </>
          )}
        </div>
      </div>
      
      <div className="h-[calc(100vh-4rem)] p-4">
        <GoogleMapComponent
          alerts={safeAlerts}
          selectedAlert={selectedAlert}
          onSelectAlert={setSelectedAlert}
        />
      </div>
    </div>
  );
};

export default LiveMap;
