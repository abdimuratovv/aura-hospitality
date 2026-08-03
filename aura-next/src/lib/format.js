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

// Builds a smoothed SVG line + area path for a series of values, scaled to its
// own min/max range (not a shared axis) — used for the Dashboard revenue/leakage
// trend, where the two series differ in magnitude by ~250x and only the shape
// of each trend, not a to-scale comparison, is the point.
export function buildTrendPaths(values, { width = 640, height = 240, padTop = 40, padBottom = 34 } = {}) {
  const n = values.length;
  if (n < 2) return { linePath: '', areaPath: '', points: [] };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => ({
    x: (i / (n - 1)) * width,
    y: padTop + (1 - (v - min) / span) * (height - padTop - padBottom),
  }));

  let linePath = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midX = ((p0.x + p1.x) / 2).toFixed(1);
    linePath += ` C${midX},${p0.y.toFixed(1)} ${midX},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L${last.x.toFixed(1)},${height} L${first.x.toFixed(1)},${height} Z`;

  return { linePath, areaPath, points };
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
