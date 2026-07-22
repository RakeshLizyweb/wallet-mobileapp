import api from './client';

export function getVerificationStatus() {
  return api.get('/verification');
}

export function getVerificationHistory() {
  return api.get('/verification/history');
}

export function submitVerification({ passport_number, passport_expiry, passportImage, selfieImage }) {
  const form = new FormData();
  form.append('passport_number', passport_number);
  form.append('passport_expiry', passport_expiry);
  form.append('passport_image', passportImage);
  form.append('selfie_image', selfieImage);

  return api.post('/verification', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getVirtualCard() {
  return api.get('/virtual-card');
}
