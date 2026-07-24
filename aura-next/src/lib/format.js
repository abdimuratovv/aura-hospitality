export function formatTime(dateInput) {
  const d = new Date(dateInput);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatAmount(amount) {
  const sign = amount < 0 ? '−' : '';
  const abs = Math.abs(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return `${sign}$${abs}`;
}

export function amountColor(amount) {
  return amount < 0 ? '#d1452e' : '#26241f';
}

export const FLAG_META = {
  CLEARED: { label: 'Cleared', color: '#1f9268', bg: 'rgba(80,180,150,.16)' },
  FLAGGED: { label: 'Flagged', color: '#d1452e', bg: 'rgba(229,86,63,.15)' },
  REVIEW: { label: 'Review', color: '#b47e12', bg: 'rgba(214,158,46,.16)' },
};

export function initialsFromName(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}
