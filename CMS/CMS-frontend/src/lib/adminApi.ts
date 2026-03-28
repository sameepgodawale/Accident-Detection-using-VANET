import { AdminUser, AuditLogEntry, UserRole } from '@/types/admin';
import { api } from '@/lib/apiClient';

// ── Users ──────────────────────────────────────────────

export const fetchUsers = () => api.get<AdminUser[]>('/admin/users');

export const updateUserRole = (userId: string, role: UserRole) =>
  api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });

export const toggleUserStatus = (userId: string, enabled: boolean) =>
  api.patch<AdminUser>(`/admin/users/${userId}/status`, { status: enabled ? 'active' : 'disabled' });

export const createUser = (data: { email: string; name: string; role: UserRole }) =>
  api.post<AdminUser>('/admin/users', data);

// ── Audit Logs ─────────────────────────────────────────

export async function fetchAuditLogs(params?: {
  action?: string;
  performedBy?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLogEntry[]> {
  const query = new URLSearchParams();
  if (params?.action) query.set('action', params.action);
  if (params?.performedBy) query.set('performedBy', params.performedBy);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  return api.get<AuditLogEntry[]>(`/admin/audit-logs?${query}`);
}
