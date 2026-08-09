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

// These *_META objects hold `color`/`bg`/`dot` as CSS custom-property
// references (var(--color-critical) etc.), not literal hex/rgba — they're
// consumed via inline `style={{...}}` in JSX, which bare Tailwind classes
// can't reach, so referencing the same theme-aware variables globals.css
// flips under `.dark` is what makes these badges dark-mode-correct too.
export function amountColor(amount) {
  return amount < 0 ? 'var(--color-critical)' : 'var(--color-ink)';
}

export const FLAG_META = {
  CLEARED: { label: 'status.cleared', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  FLAGGED: { label: 'status.flagged', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
  REVIEW: { label: 'status.review', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
};

export function initialsFromName(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export const FRAUD_SEVERITY_META = {
  CRITICAL: { label: 'status.critical', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
  HIGH: { label: 'status.high', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  MEDIUM: { label: 'status.medium', color: 'var(--color-brand)', bg: 'var(--color-info-bg)' },
};

export const RISK_BAND_META = {
  HIGH: { label: 'status.high', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
  MEDIUM: { label: 'status.medium', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  LOW: { label: 'status.low', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
};

export const ALERT_SEVERITY_META = {
  CRITICAL: { label: 'status.critical', dot: 'var(--color-critical)', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
  WARNING: { label: 'status.warning', dot: 'var(--color-warning)', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  INFO: { label: 'status.info', dot: 'var(--color-brand)', color: 'var(--color-brand)', bg: 'var(--color-info-bg)' },
};

export const CHECKLIST_STATUS_META = {
  DONE: { icon: '✓', iconC: 'text-success bg-success-bg' },
  WARNING: { icon: '!', iconC: 'text-warning bg-[rgba(var(--warning-rgb),.18)]' },
  CRITICAL: { icon: '!', iconC: 'text-critical bg-critical-bg' },
  PENDING: { icon: '○', iconC: 'text-faint bg-[rgba(var(--tint-slate),.1)]' },
};

export function timeAgo(dateInput, t) {
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (!t) return `${minutes}m ago`;
  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return t('time.minutesAgo', { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { n: hours });
  const days = Math.round(hours / 24);
  return t('time.daysAgo', { n: days });
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

// Chromium's ICU data has no short month names for Uzbek (Latin script) and
// falls back to an unreadable "M08"-style token, so short dates are built from
// the dictionaries' own `time.monthsShort` list instead of relying on
// toLocaleDateString for the month — this keeps every supported language
// legible regardless of the runtime's locale data.
export function formatShortDate(dateInput, t, { withYear = false } = {}) {
  const d = new Date(dateInput);
  if (!t) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) });
  const months = t('time.monthsShort');
  const month = Array.isArray(months) ? months[d.getMonth()] : String(d.getMonth() + 1);
  return withYear ? `${month} ${d.getDate()}, ${d.getFullYear()}` : `${month} ${d.getDate()}`;
}

export function formatRelativeDay(dateInput, t) {
  const d = new Date(dateInput);
  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  if (isSameDay) return t ? `${formatTime(d)} ${t('common.today').toLowerCase()}` : `${formatTime(d)} today`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return t ? t('time.yesterday') : 'Yesterday';
  return formatShortDate(d, t);
}
