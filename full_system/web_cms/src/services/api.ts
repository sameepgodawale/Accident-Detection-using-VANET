// web_cms/src/services/api.ts

import { IncidentLog } from '@/types/v2x';

/**
 * Fetches the list of incidents from the CMS Backend API.
 * @param statusFilter Optional filter to fetch only specific statuses (e.g., 'pending,acknowledged')
 * @returns A promise that resolves to an array of IncidentLog objects.
 */
export const fetchIncidents = async (statusFilter?: string): Promise<IncidentLog[]> => {
  let url = '/api/v1/incidents/';
  if (statusFilter) {
    url += `?status=${statusFilter}`;
  }
  
  // NOTE: This assumes your Node.js backend is running on port 5000.
  const API_BASE_URL = 'http://localhost:5000';
  
  const response = await fetch(`${API_BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error('Failed to fetch incident data from CMS API');
  }
  
  return response.json();
};
