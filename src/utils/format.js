export function formatCurrency(amount, currency = 'XOF') {
  const value = Number(amount || 0);
  const formatted = value.toLocaleString('fr-CI', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return currency === 'XOF' ? `${formatted} CFA` : `${formatted} ${currency}`;
}

export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
