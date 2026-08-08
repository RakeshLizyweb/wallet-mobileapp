import api from './client';

export function searchByPhone(phone) {
  return api.get('/users/search', { params: { phone } });
}
 

export function lookupContacts(phones) {
  return api.post('/users/lookup-contacts', { phones });
}