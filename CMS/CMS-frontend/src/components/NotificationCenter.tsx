import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, CheckCheck, AlertCircle, MessageSquare, Radio, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/commsApi';
import type { NotificationCenterItem } from '@/types/communication';

const typeIcons: Record<string, typeof Bell> = {
  alert: AlertCircle,
  response: Radio,
  system: Bell,
  message: MessageSquare,
};

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const load = () => {
    setLoading(true);
    fetchNotifications()
      .then((data) => setNotifications(data || [])) // ✅ safe fallback
      .catch(() => setNotifications([])) // ✅ prevent crash
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-critical text-critical-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[380px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </SheetTitle>

            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs">
                <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-6rem)] mt-4">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-1">
              {notifications?.filter(Boolean).map((notification) => {
                const Icon = typeIcons[notification?.type || "system"] || Bell;

                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      notification.read
                        ? 'hover:bg-muted/50'
                        : 'bg-primary/5 hover:bg-primary/10 border-l-2 border-primary'
                    }`}
                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <Icon
                        className={`w-4 h-4 mt-0.5 ${
                          notification.read ? 'text-muted-foreground' : 'text-primary'
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.read ? '' : 'font-medium'}`}>
                          {notification.title}
                        </p>

                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {notification.description}
                        </p>

                        <span className="text-[10px] text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
