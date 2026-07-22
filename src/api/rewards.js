import api from './client';

export function listRewards(params = {}) {
  return api.get('/rewards', { params });
}

export function getRewardsSummary() {
  return api.get('/rewards/summary');
}

export function scratchCard(id) {
  return api.post(`/rewards/${id}/scratch`);
}

export function redeemCard(id) {
  return api.post(`/rewards/${id}/redeem`);
}
