import { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { EmergencyMap } from '@/components/EmergencyMap';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { AccidentAlert } from '@/types/emergency';

const LiveMap = () => {
  const { alerts, isConnected } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<AccidentAlert | undefined>();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="h-14 border-b border-border bg-card/50 px-6 flex items-center">
        <h1 className="text-xl font-bold">Live Map</h1>
        <div className="ml-auto flex items-center gap-3">
          {isConnected ? (
            <Badge variant="outline" className="border-success/30 text-success gap-1">
              <Wifi className="w-3 h-3" /> Live
            </Badge>
          ) : (
            <Badge variant="outline" className="border-warning/30 text-warning gap-1">
              <WifiOff className="w-3 h-3" /> Disconnected
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {alerts.length} Active Incidents
          </span>
        </div>
      </div>
      
      <div className="flex-1">
        <EmergencyMap
          alerts={alerts}
          selectedAlert={selectedAlert}
          onSelectAlert={setSelectedAlert}
        />
      </div>
    </div>
  );
};

export default LiveMap;
