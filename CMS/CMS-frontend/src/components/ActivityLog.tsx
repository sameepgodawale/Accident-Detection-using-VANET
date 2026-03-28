import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Car,
  MessageSquare,
  RefreshCw,
  Settings,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchActivityLog } from '@/lib/commsApi';
import type { ActivityEntry } from '@/types/communication';

interface ActivityLogProps {
  alertId: string;
}

const typeIcons: Record<string, typeof Bell> = {
  notification: Bell,
  dispatch: Car,
  communication: MessageSquare,
  status_change: RefreshCw,
  system: Settings,
};

const typeColors: Record<string, string> = {
  notification: 'text-warning',
  dispatch: 'text-primary',
  communication: 'text-success',
  status_change: 'text-accent',
  system: 'text-muted-foreground',
};

export const ActivityLog = ({ alertId }: ActivityLogProps) => {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alertId) return;
    setLoading(true);
    fetchActivityLog(alertId)
      .then(setEntries)
      .catch(() => toast.error('Failed to load activity log'))
      .finally(() => setLoading(false));
  }, [alertId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Activity Log</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {entries.length} entries
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet.
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {entries.map(entry => {
                const Icon = typeIcons[entry.type] || Settings;
                const color = typeColors[entry.type] || 'text-muted-foreground';

                return (
                  <div key={entry.id} className="flex gap-3 relative">
                    <div className={`z-10 mt-0.5 p-1 rounded-full bg-card border border-border ${color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{entry.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          by {entry.performedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
