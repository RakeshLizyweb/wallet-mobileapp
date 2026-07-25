import api from './client';

export function searchByPhone(phone) {
  return api.get('/users/search', { params: { phone } });
}
