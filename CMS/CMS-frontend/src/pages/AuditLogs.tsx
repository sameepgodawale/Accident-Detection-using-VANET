import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/lib/adminApi';
import { AuditAction } from '@/types/admin';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollText, Search, Filter } from 'lucide-react';

const ACTION_CATEGORIES: Record<string, AuditAction[]> = {
  User: ['user.created', 'user.updated', 'user.disabled', 'user.enabled', 'user.role_changed'],
  Alert: ['alert.dispatched', 'alert.acknowledged', 'alert.resolved'],
  System: ['system.login', 'system.logout', 'system.settings_changed'],
};

const actionColor = (action: AuditAction) => {
  if (action.startsWith('user.disabled') || action.startsWith('alert.')) return 'border-warning/30 text-warning';
  if (action.startsWith('user.')) return 'border-primary/30 text-primary';
  if (action === 'system.login') return 'border-success/30 text-success';
  return 'border-muted-foreground/30 text-muted-foreground';
};

const AuditLogs = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data: logs = [], isLoading, isError } = useQuery({
    queryKey: ['audit-logs', actionFilter],
    queryFn: () =>
      fetchAuditLogs({
        action: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 100,
      }),
    retry: false,
  });

  const filtered = logs.filter(
    (log) =>
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <ScrollText className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold">Audit Logs</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(ACTION_CATEGORIES).map(([cat, actions]) =>
                    actions.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a.replace('.', ' › ')}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} entries
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading audit logs…</div>
          ) : isError ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-muted-foreground">Could not connect to the admin API.</p>
              <p className="text-xs text-muted-foreground">
                Ensure your MongoDB backend is running and{' '}
                <code className="font-mono-data text-primary">/api/admin/audit-logs</code> is
                reachable.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No audit log entries found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono-data text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColor(log.action)}>
                        {log.action.replace('.', ' › ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{log.performedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs text-muted-foreground">
                      {log.ipAddress ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
