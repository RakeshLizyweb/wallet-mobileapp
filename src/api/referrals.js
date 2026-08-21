import api from './client';

export function getReferralSummary() {
  return api.get('/referrals/summary');
}
