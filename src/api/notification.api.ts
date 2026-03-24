import api from './axios';
import type { NotificationItem } from '../types/notification';

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const { data } = await api.get('/notifications');
  return data;
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await api.get('/notifications/unread-count');
  return data?.unreadCount || 0;
};

export const markNotificationAsRead = async (notificationId: string): Promise<NotificationItem> => {
  const { data } = await api.put(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};
