import { api } from '@/lib/apiClient';
import type {
  EmergencyService,
  ChatMessage,
  ActivityEntry,
  NotificationCenterItem,
} from '@/types/communication';

// Emergency service notifications
export const fetchNearbyServices = (alertId: string) =>
  api.get<EmergencyService[]>(`/alerts/${alertId}/services`);

export const notifyService = (alertId: string, serviceId: string, message?: string) =>
  api.post<EmergencyService>(`/alerts/${alertId}/services/${serviceId}/notify`, { message });

export const notifyAllServices = (alertId: string) =>
  api.post<EmergencyService[]>(`/alerts/${alertId}/services/notify-all`, {});

// In-app messaging
export const fetchMessages = (alertId: string) =>
  api.get<ChatMessage[]>(`/alerts/${alertId}/messages`);

export const sendMessage = (alertId: string, content: string) =>
  api.post<ChatMessage>(`/alerts/${alertId}/messages`, { content });

// Activity log
export const fetchActivityLog = (alertId: string) =>
  api.get<ActivityEntry[]>(`/alerts/${alertId}/activity`);

// Notification center
export const fetchNotifications = () =>
  api.get<NotificationCenterItem[]>('/notifications');

export const markNotificationRead = (notificationId: string) =>
  api.patch<void>(`/notifications/${notificationId}/read`, {});

export const markAllNotificationsRead = () =>
  api.post<void>('/notifications/read-all', {});
