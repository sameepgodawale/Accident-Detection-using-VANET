import { useState, useEffect } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { EmergencyServicesPanel } from '@/components/EmergencyServicesPanel';
import { IncidentChat } from '@/components/IncidentChat';
import { ActivityLog } from '@/components/ActivityLog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  MessageSquare,
  Radio,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { AccidentAlert } from '@/types/emergency';

const Communications = () => {
  const { alerts } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<AccidentAlert | null>(null);

  // Auto-select first alert
  useEffect(() => {
    if (!selectedAlert && alerts.length > 0) {
      setSelectedAlert(alerts[0]);
    }
  }, [alerts, selectedAlert]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="h-14 border-b border-border bg-card/50 px-6 flex items-center gap-3">
        <Radio className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Communications</h1>
        <Badge variant="outline" className="ml-2">
          {alerts.length} Active Incidents
        </Badge>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Incident list (left) */}
        <aside className="w-[280px] border-r border-border bg-card/30 flex flex-col">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold text-muted-foreground">Select Incident</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {alerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedAlert?.id === alert.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`w-3.5 h-3.5 ${
                      alert.severity === 'critical' ? 'text-critical' : 
                      alert.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'
                    }`} />
                    <span className="text-xs font-mono-data truncate">{alert.id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{alert.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </div>
                </Card>
              ))}
              {alerts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active incidents
                </p>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main comms area */}
        {selectedAlert ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Incident header */}
            <div className="px-4 py-3 border-b border-border bg-card/50">
              <div className="flex items-center gap-3">
                <Badge variant={
                  selectedAlert.severity === 'critical' ? 'critical' :
                  selectedAlert.severity === 'warning' ? 'warning' : 'default'
                }>
                  {selectedAlert.severity}
                </Badge>
                <span className="font-medium text-sm">{selectedAlert.address}</span>
                <span className="text-xs font-mono-data text-muted-foreground ml-auto">
                  {selectedAlert.id}
                </span>
              </div>
            </div>

            {/* Tabs for services, chat, activity, voice */}
            <Tabs defaultValue="services" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 border-b border-border">
                <TabsList className="h-10">
                  <TabsTrigger value="services" className="gap-1 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" /> Services
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="gap-1 text-xs">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-1 text-xs">
                    <Clock className="w-3.5 h-3.5" /> Activity
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="gap-1 text-xs">
                    <Phone className="w-3.5 h-3.5" /> Voice
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="services" className="flex-1 overflow-auto p-4 mt-0">
                <EmergencyServicesPanel alertId={selectedAlert.id} />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
                <IncidentChat alertId={selectedAlert.id} />
              </TabsContent>

              <TabsContent value="activity" className="flex-1 overflow-hidden mt-0">
                <ActivityLog alertId={selectedAlert.id} />
              </TabsContent>

              <TabsContent value="voice" className="flex-1 overflow-auto p-4 mt-0">
                <VoiceCallPanel alertId={selectedAlert.id} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Radio className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an incident to start communicating</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline voice call panel
function VoiceCallPanel({ alertId }: { alertId: string }) {
  const services = [
    { label: 'Nearest Hospital', icon: '🏥', number: '+1-911-HOSP' },
    { label: 'Police Station', icon: '🚔', number: '+1-911-POLICE' },
    { label: 'Fire Station', icon: '🚒', number: '+1-911-FIRE' },
    { label: 'Dispatch Center', icon: '📡', number: '+1-911-DISPATCH' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Phone className="w-4 h-4 text-primary" />
        Quick Call
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {services.map(svc => (
          <Card key={svc.label} className="p-4 text-center hover:bg-muted/50 transition-colors">
            <div className="text-3xl mb-2">{svc.icon}</div>
            <p className="text-sm font-medium">{svc.label}</p>
            <a
              href={`tel:${svc.number}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              <Phone className="w-3 h-3" />
              {svc.number}
            </a>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Click-to-call requires a VoIP-enabled device or softphone. Calls are logged automatically.
      </p>
    </div>
  );
}

export default Communications;
