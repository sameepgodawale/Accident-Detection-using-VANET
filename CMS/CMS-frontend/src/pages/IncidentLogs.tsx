import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchIncidents, exportIncidentsCsv } from '@/lib/incidentApi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollText, Search, Download } from 'lucide-react';

const IncidentLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: incidents = [], isLoading, isError } = useQuery({
    queryKey: ['incidents', filterStatus, searchTerm],
    queryFn: () => fetchIncidents({ status: filterStatus, search: searchTerm, limit: 200 }),
    retry: false,
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'border-warning/30 text-warning',
      acknowledged: 'border-primary/30 text-primary',
      verified: 'border-success/30 text-success',
      resolved: 'border-muted-foreground/30 text-muted-foreground',
    };
    return map[status] || 'border-muted-foreground/30 text-muted-foreground';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="h-14 border-b border-border bg-card/50 px-6 flex items-center">
        <ScrollText className="w-5 h-5 mr-3 text-primary" />
        <h1 className="text-xl font-bold">Incident Logs</h1>
      </div>

      <div className="p-6 border-b border-border bg-card/30">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, address, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" asChild>
            <a href={exportIncidentsCsv()} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading incidents…</div>
        ) : isError ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground">Could not connect to the backend API.</p>
            <p className="text-xs text-muted-foreground">
              Ensure <code className="font-mono-data text-primary">VITE_API_URL</code> is set and the Express server is running.
            </p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No incidents found matching your criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-mono-data text-xs">{inc.alertId}</TableCell>
                  <TableCell className="text-sm">{inc.address}</TableCell>
                  <TableCell className="font-mono-data text-xs">{inc.vehicleId} ({inc.vehicleType})</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      inc.severity === 'critical' ? 'border-critical/30 text-critical' :
                      inc.severity === 'warning' ? 'border-warning/30 text-warning' :
                      'border-muted-foreground/30 text-muted-foreground'
                    }>
                      {inc.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusBadge(inc.status)}>
                      {inc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono-data text-xs text-muted-foreground">
                    {new Date(inc.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default IncidentLogs;
