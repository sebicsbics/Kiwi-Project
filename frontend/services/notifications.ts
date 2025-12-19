import { api } from './api';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  contract_id: number;
  contract_title: string;
  created_at: string;
}

export const notificationsService = {
  async getNotifications(token: string): Promise<Notification[]> {
    return api.get('/notifications/', token);
  },
  
  async markAsRead(notificationId: number, token: string): Promise<{ message: string }> {
    return api.post(`/notifications/${notificationId}/mark-read/`, {}, token);
  },
  
  async markAllAsRead(token: string): Promise<{ message: string }> {
    return api.post('/notifications/mark-all-read/', {}, token);
  },
  
  async getUnreadCount(token: string): Promise<number> {
    const notifications = await this.getNotifications(token);
    return notifications.filter(n => !n.is_read).length;
  },
};