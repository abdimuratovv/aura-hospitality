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

export const FRAUD_SEVERITY_META = {
  CRITICAL: { label: 'Critical', color: '#d1452e', bg: 'rgba(229,86,63,.15)' },
  HIGH: { label: 'High', color: '#b47e12', bg: 'rgba(214,158,46,.16)' },
  MEDIUM: { label: 'Medium', color: '#4f8cff', bg: 'rgba(79,140,255,.14)' },
};

export const RISK_BAND_META = {
  HIGH: { label: 'High', color: '#d1452e', bg: 'rgba(229,86,63,.15)' },
  MEDIUM: { label: 'Medium', color: '#b47e12', bg: 'rgba(214,158,46,.16)' },
  LOW: { label: 'Low', color: '#1f9268', bg: 'rgba(80,180,150,.16)' },
};

export const ALERT_SEVERITY_META = {
  CRITICAL: { label: 'Critical', dot: '#d1452e', color: '#d1452e', bg: 'rgba(229,86,63,.15)' },
  WARNING: { label: 'Warning', dot: '#b47e12', color: '#b47e12', bg: 'rgba(214,158,46,.16)' },
  INFO: { label: 'Info', dot: '#4f8cff', color: '#4f8cff', bg: 'rgba(79,140,255,.14)' },
};

export const CHECKLIST_STATUS_META = {
  DONE: { icon: '✓', iconC: 'text-success bg-success-bg' },
  WARNING: { icon: '!', iconC: 'text-warning bg-[rgba(214,158,46,.18)]' },
  CRITICAL: { icon: '!', iconC: 'text-critical bg-critical-bg' },
  PENDING: { icon: '○', iconC: 'text-faint bg-[rgba(60,70,110,.1)]' },
};

export function timeAgo(dateInput) {
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatRelativeDay(dateInput) {
  const d = new Date(dateInput);
  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  if (isSameDay) return `${formatTime(d)} today`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
