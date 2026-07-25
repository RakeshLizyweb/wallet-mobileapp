import api from './client';

export function getBalance(pin) {
  return api.get('/account', { headers: { 'X-Pin': pin } });
}

export function getMiniStatement() {
  return api.get('/account/statement/mini');
}

export function getFullStatement(params = {}) {
  return api.get('/account/statement/full', { params });
}
