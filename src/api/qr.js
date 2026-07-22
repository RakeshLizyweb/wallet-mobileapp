import api from './client';

export function getMyQr() {
  return api.get('/qr');
}

export function validateQr(payload) {
  return api.post('/qr/validate', { payload });
}
