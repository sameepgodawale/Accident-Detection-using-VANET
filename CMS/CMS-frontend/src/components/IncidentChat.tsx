import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Loader2, Shield, Hospital, Flame, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMessages, sendMessage } from '@/lib/commsApi';
import type { ChatMessage } from '@/types/communication';

interface IncidentChatProps {
  alertId: string;
}

const roleIcons: Record<string, typeof Shield> = {
  operator: Radio,
  field_team: Radio,
  hospital: Hospital,
  police: Shield,
  fire: Flame,
};

const roleColors: Record<string, string> = {
  operator: 'text-primary',
  field_team: 'text-success',
  hospital: 'text-critical',
  police: 'text-primary',
  fire: 'text-warning',
};

export const IncidentChat = ({ alertId }: IncidentChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alertId) return;
    setLoading(true);
    fetchMessages(alertId)
      .then(setMessages)
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  }, [alertId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(alertId, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Incident Chat</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {messages.length} messages
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef as any}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const Icon = roleIcons[msg.senderRole] || Radio;
              const color = roleColors[msg.senderRole] || 'text-muted-foreground';

              if (msg.type === 'system') {
                return (
                  <div key={msg.id} className="text-center">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex gap-2">
                  <div className={`mt-1 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold">{msg.senderName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};
