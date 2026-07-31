import api from './client';

export function walletToWallet(receiver, amount, pin, note) {
  return api.post('/transfers/wallet-to-wallet', { receiver, amount, pin, note });
}

export function accountToAccount(receiver, amount, pin, note) {
  return api.post('/transfers/account-to-account', { receiver, amount, pin, note });
}

export function accountToWallet(amount, pin, note) {
  return api.post('/transfers/account-to-wallet', { amount, pin, note });
}

export function walletToAccount(amount, pin, note) {
  return api.post('/transfers/wallet-to-account', { amount, pin, note });
}

export function listTransfers(params = {}) {
  return api.get('/transfers', { params });
}

export function getRecentContacts() {
  return api.get('/transfers/recent-contacts');
}

export function getTransfer(reference) {
  return api.get(`/transfers/${reference}`);
}
