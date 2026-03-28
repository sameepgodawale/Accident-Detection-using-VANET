export type UserRole = 'admin' | 'operator' | 'viewer';
export type UserStatus = 'active' | 'disabled';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
}

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.disabled'
  | 'user.enabled'
  | 'user.role_changed'
  | 'alert.dispatched'
  | 'alert.acknowledged'
  | 'alert.resolved'
  | 'system.login'
  | 'system.logout'
  | 'system.settings_changed';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  performedBy: string; // user name or email
  targetId?: string;
  targetType?: 'user' | 'alert' | 'system';
  details: string;
  timestamp: Date;
  ipAddress?: string;
}
