import api from './client';

export function getBalance(pin) {
  return api.get('/wallet', { headers: { 'X-Pin': pin } });
}

export function getMiniStatement() {
  return api.get('/wallet/statement/mini');
}

export function getFullStatement(params = {}) {
  return api.get('/wallet/statement/full', { params });
}

export function getLimits() {
  return api.get('/limits');
}
