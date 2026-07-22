import api from './client';

export function walletToWallet(receiver, amount, pin, note) {
  return api.post('/transfers/wallet-to-wallet', { receiver, amount, pin, note });
}

export function walletToBank(bank_account_id, amount, pin, note) {
  return api.post('/transfers/wallet-to-bank', { bank_account_id, amount, pin, note });
}

export function bankToWallet(bank_account_id, amount, note) {
  return api.post('/transfers/bank-to-wallet', { bank_account_id, amount, note });
}

export function listTransfers(params = {}) {
  return api.get('/transfers', { params });
}

export function getTransfer(reference) {
  return api.get(`/transfers/${reference}`);
}
