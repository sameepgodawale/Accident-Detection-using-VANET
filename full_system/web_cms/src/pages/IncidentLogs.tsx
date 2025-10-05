// web_cms/src/pages/IncidentLogs.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; 
import { fetchIncidents } from '@/services/api'; 
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollText, Search, Download, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { IncidentLog } from '@/types/v2x';

const IncidentLogs = () => {
  // --- REAL-TIME DATA FETCH ---
  const { data: logs, isLoading, error } = useQuery<IncidentLog[]>({
    queryKey: ['incidentLogs'],
    queryFn: () => fetchIncidents(), 
    refetchInterval: 10000, 
  });
  // ----------------------------

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'verified':
        return 'default';
      case 'acknowledged':
        return 'warning';
      default:
        return 'destructive';
    }
  };

  const safeLogs = logs || []; // Use empty array if data is undefined or loading

  const filteredLogs = safeLogs.filter((log) => {
    const matchesSearch = 
      log.accidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen flex flex-col">
      <div className="h-16 border-b border-border bg-card/50 px-6 flex items-center">
        <ScrollText className="w-6 h-6 mr-3 text-primary" />
        <h1 className="text-2xl font-bold">Incident Logs</h1>
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

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* --- LOADING AND ERROR STATES --- */}
        {isLoading && (
            <div className="text-center py-12 text-primary animate-pulse">
                <Clock className="w-8 h-8 mx-auto mb-4" />
                <p>Loading real-time incident data...</p>
            </div>
        )}
        
        {error && (
            <div className="text-center py-12 text-destructive">
                <p>Error fetching data: {(error as Error).message}</p>
                <p className="text-sm text-muted-foreground">Check your backend API connection.</p>
            </div>
        )}
        {/* --------------------------------- */}

        <div className="space-y-3">
          {!isLoading && !error && filteredLogs.map((log) => (
            <Card key={log.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{log.accidentId}</h3>
                    <p className="text-xs font-mono-data text-muted-foreground">
                      {log.id}
                    </p>
                  </div>
                  <Badge variant={getSeverityVariant(log.severity)}>
                    {log.severity}
                  </Badge>
                  <Badge variant={getStatusVariant(log.status)}>
                    {log.status}
                  </Badge>
                </div>
                
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Confidence Score</div>
                  <div className="text-xl font-bold font-mono-data">{log.confidenceScore}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">{log.address}</div>
                    <div className="text-xs text-muted-foreground font-mono-data">
                      {log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-1 text-warning flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">Timestamp</div>
                    <div className="font-medium">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </div>
                    {log.responseTime && (
                      <div className="text-xs text-success">
                        Response: {log.responseTime}s
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-muted-foreground">Vehicle</div>
                  <div className="font-medium font-mono-data">{log.vehicleId}</div>
                  {log.dispatchedUnits.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Units: {log.dispatchedUnits.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-1">Notes</div>
                <div className="text-sm">{log.notes}</div>
              </div>
            </Card>
          ))}
        </div>

        {filteredLogs.length === 0 && !isLoading && !error && (
          <div className="text-center py-12 text-muted-foreground">
            No incidents found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentLogs;
