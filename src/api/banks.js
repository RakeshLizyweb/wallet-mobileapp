import api from './client';

export function listBanks() {
  return api.get('/banks');
}

export function addBank(payload) {
  return api.post('/banks', payload);
}

export function updateBank(id, payload) {
  return api.put(`/banks/${id}`, payload);
}

export function setPrimaryBank(id) {
  return api.post(`/banks/${id}/primary`);
}

export function deleteBank(id) {
  return api.delete(`/banks/${id}`);
}
