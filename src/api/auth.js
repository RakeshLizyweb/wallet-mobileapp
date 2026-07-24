import api from './client';

export function register(name, phone, nationality) {
  return api.post('/auth/register', { name, phone, nationality });
}

export function login(phone) {
  return api.post('/auth/login', { phone });
}

export function verifyOtp(phone, otp, purpose, device) {
  return api.post('/auth/verify-otp', { phone, otp, purpose, device });
}

export function resendOtp(phone, purpose) {
  return api.post('/auth/resend-otp', { phone, purpose });
}

export function forgotPin(phone) {
  return api.post('/auth/forgot-pin', { phone });
}

export function resetPin(phone, otp, pin, pin_confirmation) {
  return api.post('/auth/reset-pin', { phone, otp, pin, pin_confirmation });
}

export function me() {
  return api.get('/auth/me');
}

export function updateNationality(nationality) {
  return api.put('/auth/nationality', { nationality });
}

export function logout() {
  return api.post('/auth/logout');
}

export function logoutAllDevices() {
  return api.post('/auth/logout-all');
}

export function refreshToken() {
  return api.post('/auth/refresh');
}

export function deactivateAccount(pin) {
  return api.post('/auth/deactivate', { pin });
}

export function deleteAccount(pin) {
  return api.delete('/auth/account', { data: { pin } });
}

export function setPin(pin, pin_confirmation) {
  return api.post('/pin', { pin, pin_confirmation });
}

export function changePin(current_pin, pin, pin_confirmation) {
  return api.put('/pin', { current_pin, pin, pin_confirmation });
}

export function listDevices() {
  return api.get('/devices');
}

export function updateFcmToken(device_id, fcm_token) {
  return api.post('/devices/fcm-token', { device_id, fcm_token });
}

export function removeDevice(deviceId) {
  return api.delete(`/devices/${deviceId}`);
}
