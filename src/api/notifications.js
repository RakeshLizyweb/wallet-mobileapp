import api from './client';

export function listNotifications(params = {}) {
  return api.get('/notifications', { params });
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count');
}

export function markAsRead(id) {
  return api.post(`/notifications/${id}/read`);
}

export function markAllAsRead() {
  return api.post('/notifications/read-all');
}
