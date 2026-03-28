import { AlertTriagePanel } from '@/components/AlertTriagePanel';
import { EmergencyMap } from '@/components/EmergencyMap';
import { EmergencyServicesPanel } from '@/components/EmergencyServicesPanel';
import { AccidentAlert } from '@/types/emergency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Car, Activity, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAlerts } from '@/hooks/useAlerts';
import { useState } from 'react';


const Index = () => {
  const { alerts, isConnected, isLoading, error, dispatchAlert } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<AccidentAlert | undefined>();

  const handleDispatch = async (alertId: string) => {
    try {
      await dispatchAlert(alertId);
      toast.success('Emergency Response Dispatched', {
        description: `Units dispatched to ${alerts.find(a => a.id === alertId)?.address}`,
      });
    } catch {
      toast.error('Failed to dispatch', { description: 'Check backend connection.' });
    }
  };

  const handleSelectAlert = (alert: AccidentAlert) => {
    setSelectedAlert(alert);
  };

  const safeAlerts = (alerts || []).filter(Boolean);

const activeAlerts = safeAlerts.filter((a) => a.status === 'new');
const dispatchedCount = safeAlerts.filter((a) => a.status === 'dispatched').length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* KPI Bar */}
      <div className="px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="border-success/30 text-success gap-1">
                <Wifi className="w-3 h-3" /> Live
              </Badge>
            ) : (
              <Badge variant="outline" className="border-warning/30 text-warning gap-1">
                <WifiOff className="w-3 h-3" /> Disconnected
              </Badge>
            )}
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-critical" />
            <span className="text-sm text-muted-foreground">Active:</span>
            <span className="text-lg font-bold font-mono-data text-critical">{activeAlerts.length}</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Dispatched:</span>
            <span className="text-lg font-bold font-mono-data text-success">{dispatchedCount}</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-lg font-bold font-mono-data">{alerts.length}</span>
          </div>
          <div className="ml-auto">
            <Button
              variant="dispatch"
              size="sm"
              disabled={activeAlerts.length === 0}
              onClick={() => activeAlerts[0] && handleDispatch(activeAlerts[0].id)}
            >
              Dispatch First Alert
            </Button>
          </div>
        </div>
        {error && (
          <p className="text-xs text-warning mt-2">⚠ {error}</p>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <div className="flex-1">
            <EmergencyMap
              alerts={alerts}
              selectedAlert={selectedAlert}
              onSelectAlert={handleSelectAlert}
            />
          </div>
          {selectedAlert && (
            <div className="h-[200px] overflow-auto border border-border rounded-lg bg-card/50 p-3">
              <EmergencyServicesPanel alertId={selectedAlert.id} />
            </div>
          )}
        </div>
        <aside className="w-[380px] border-l border-border bg-card/50 overflow-hidden">
          <AlertTriagePanel
            alerts={alerts}
            onSelectAlert={handleSelectAlert}
            onDispatch={handleDispatch}
            selectedAlertId={selectedAlert?.id}
          />
        </aside>
      </main>
    </div>
  );
};

export default Index;
