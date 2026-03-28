import { AccidentAlert } from '@/types/emergency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock, MapPin, Car, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertTriagePanelProps {
  alerts: AccidentAlert[];
  onSelectAlert: (alert: AccidentAlert) => void;
  onDispatch: (alertId: string) => void;
  selectedAlertId?: string;
}

export const AlertTriagePanel = ({
  alerts,
  onSelectAlert,
  onDispatch,
  selectedAlertId,
}: AlertTriagePanelProps) => {
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, moderate: 2 };
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (a.status !== 'new' && b.status === 'new') return 1;
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const getSeverityVariant = (severity: AccidentAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatETA = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-card/50">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-critical" />
          Active Incidents
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {alerts.filter(a => a.status === 'new').length} Pending Response
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedAlertId === alert.id
                ? 'ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
                : ''
            } ${
              alert.status === 'new' && alert.severity === 'critical'
                ? 'pulse-critical'
                : alert.status === 'new' && alert.severity === 'warning'
                ? 'pulse-warning'
                : ''
            }`}
            onClick={() => onSelectAlert(alert)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={getSeverityVariant(alert.severity)}>
                  {alert.severity}
                </Badge>
                <span className="text-xs font-mono-data text-muted-foreground">
                  {alert.id}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{alert.address}</span>
              </div>

              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono-data">
                  {alert.vehicle.type} - {alert.vehicle.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs">
                  Impact: {alert.impactForce}% | Injury Risk: {alert.injuryLikelihood}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-sm font-bold font-mono-data">
                    ETA: {formatETA(alert.dispatchETA)}
                  </span>
                </div>

                {alert.status === 'new' && (
                  <Button
                    variant="dispatch"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatch(alert.id);
                    }}
                  >
                    Dispatch
                  </Button>
                )}

                {alert.status === 'dispatched' && (
                  <Badge variant="success">Dispatched</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
