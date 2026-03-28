import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Hospital,
  Shield,
  Flame,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Navigation,
  Phone,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchNearbyServices, notifyService, notifyAllServices } from '@/lib/commsApi';
import type { EmergencyService, ServiceType, NotificationStatus } from '@/types/communication';

interface EmergencyServicesPanelProps {
  alertId: string;
}

const serviceIcons: Record<ServiceType, typeof Hospital> = {
  hospital: Hospital,
  police: Shield,
  fire: Flame,
};

const serviceColors: Record<ServiceType, string> = {
  hospital: 'text-critical',
  police: 'text-primary',
  fire: 'text-warning',
};

const statusConfig: Record<NotificationStatus, { label: string; variant: 'default' | 'critical' | 'warning' | 'success' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  sent: { label: 'Auto-Notified', variant: 'warning' },
  acknowledged: { label: 'Acknowledged', variant: 'default' },
  en_route: { label: 'En Route', variant: 'success' },
  on_scene: { label: 'On Scene', variant: 'success' },
  failed: { label: 'Failed — Retry', variant: 'critical' },
};

export const EmergencyServicesPanel = ({ alertId }: EmergencyServicesPanelProps) => {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [notifyingAll, setNotifyingAll] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (!alertId) return;
    setLoading(true);
    fetchNearbyServices(alertId)
      .then(setServices)
      .catch(() => toast.error('Failed to load nearby services'))
      .finally(() => setLoading(false));
  }, [alertId]);

  const handleNotify = async (service: EmergencyService, message?: string) => {
    setNotifying(service.id);
    try {
      const updated = await notifyService(alertId, service.id, message);
      setServices(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      toast.success(`Notified ${service.name}`);
    } catch {
      toast.error(`Failed to notify ${service.name}`);
    } finally {
      setNotifying(null);
    }
  };

  const handleNotifyAll = async () => {
    setNotifyingAll(true);
    try {
      const updated = await notifyAllServices(alertId);
      setServices(updated);
      toast.success('All nearby services notified');
    } catch {
      toast.error('Failed to notify all services');
    } finally {
      setNotifyingAll(false);
    }
  };

  const openManualNotify = (service: EmergencyService) => {
    setSelectedService(service);
    setCustomMessage('');
    setManualDialogOpen(true);
  };

  const handleManualSend = async () => {
    if (!selectedService) return;
    await handleNotify(selectedService, customMessage);
    setManualDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Nearby Emergency Services</h3>
        <Button
          variant="dispatch"
          size="sm"
          onClick={handleNotifyAll}
          disabled={notifyingAll || services.every(s => s.status !== 'pending')}
        >
          {notifyingAll ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
          Notify All
        </Button>
      </div>

      <div className="space-y-2">
        {services.map(service => {
          const Icon = serviceIcons[service.type];
          const color = serviceColors[service.type];
          const status = statusConfig[service.status];

          return (
            <Card key={service.id} className="p-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{service.name}</span>
                    <Badge variant={status.variant as any}>{status.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {service.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{service.estimatedArrival} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`tel:${service.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {service.phone}
                    </a>
                    {service.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs px-2"
                          disabled={notifying === service.id}
                          onClick={() => handleNotify(service)}
                        >
                          {notifying === service.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-1" /> Notify
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => openManualNotify(service)}
                        >
                          Custom
                        </Button>
                      </>
                    )}
                    {service.status === 'sent' && (
                      <span className="text-xs text-warning flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Awaiting response
                      </span>
                    )}
                    {(service.status === 'acknowledged' || service.status === 'en_route' || service.status === 'on_scene') && (
                      <span className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {status.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Custom Notification</DialogTitle>
            <DialogDescription>
              Send a custom message to {selectedService?.name}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Custom message (optional)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="dispatch" onClick={handleManualSend}>
              <Send className="w-4 h-4 mr-1" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
