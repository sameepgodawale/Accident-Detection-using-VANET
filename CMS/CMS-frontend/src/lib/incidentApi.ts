import { api } from '@/lib/apiClient';

export interface IncidentLog {
  id: string;
  alertId: string;
  address: string;
  vehicleId: string;
  vehicleType: string;
  severity: string;
  status: string;
  timestamp: string;
  resolvedAt?: string;
  description: string;
}

export const fetchIncidents = (params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  return api.get<IncidentLog[]>(`/accidents?${query}`);
};

export const exportIncidentsCsv = () =>
  `${(import.meta.env.VITE_API_URL || '/api')}/accidents/export?format=csv`
