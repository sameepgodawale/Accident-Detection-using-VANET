// web_cms/src/services/api.ts

import { IncidentLog } from '@/types/v2x';

export const fetchIncidents = async (statusFilter?: string): Promise<IncidentLog[]> => {
  let url = '/api/v1/incidents/';
  if (statusFilter) {
    url += `?status=${statusFilter}`;
  }
  
  const API_BASE_URL = 'http://localhost:5000'; 
  
  const response = await fetch(`${API_BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error('Failed to fetch incident data from CMS API');
  }
  
  return response.json();
};
