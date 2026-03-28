export type ServiceType = 'hospital' | 'police' | 'fire';

export type NotificationStatus = 'pending' | 'sent' | 'acknowledged' | 'en_route' | 'on_scene' | 'failed';

export interface EmergencyService {
  id: string;
  name: string;
  type: ServiceType;
  phone: string;
  distance: number; // km
  estimatedArrival: number; // minutes
  status: NotificationStatus;
  notifiedAt?: string;
  acknowledgedAt?: string;
}

export interface IncidentNotification {
  alertId: string;
  services: EmergencyService[];
}

export interface ChatMessage {
  id: string;
  alertId: string;
  senderId: string;
  senderName: string;
  senderRole: 'operator' | 'field_team' | 'hospital' | 'police' | 'fire';
  content: string;
  timestamp: string;
  type: 'text' | 'status_update' | 'system';
}

export interface ActivityEntry {
  id: string;
  alertId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  type: 'notification' | 'dispatch' | 'communication' | 'status_change' | 'system';
  metadata?: Record<string, string>;
}

export interface NotificationCenterItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'response' | 'system' | 'message';
  alertId?: string;
}
