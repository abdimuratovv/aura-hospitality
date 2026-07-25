'use client';

import { useEffect, useState } from 'react';
import { ALERT_SEVERITY_META, timeAgo } from '../../lib/format.js';

export default function AlertsCenter() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load alerts');
        return res.json();
      })
      .then((json) => setRows(json.rows))
      .catch((err) => setError(err.message));
  }, []);

  const counts = { CRITICAL: 0, WARNING: 0, INFO: 0 };
  for (const a of rows ?? []) counts[a.severity] = (counts[a.severity] ?? 0) + 1;
  const total = rows?.length ?? 0;

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className="cursor-pointer rounded-xl border border-white/80 px-4 py-2.5 text-sm font-semibold text-brand"
          style={{ background: 'linear-gradient(150deg,rgba(255,255,255,.95),rgba(255,255,255,.55))', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.9),0 8px 18px -12px rgba(79,140,255,.5)' }}
        >
          All · {total}
        </span>
        <span className="pill px-4 py-2.5 text-sm">Critical · {counts.CRITICAL}</span>
        <span className="pill px-4 py-2.5 text-sm">Warning · {counts.WARNING}</span>
        <span className="pill px-4 py-2.5 text-sm">Info · {counts.INFO}</span>
      </div>
      <div className="glass-card p-2">
        {error && <div className="px-4 py-6 text-sm text-critical">{error}</div>}
        {!error && !rows && <div className="px-4 py-6 text-sm text-faint">Loading…</div>}

        {rows?.map((a) => {
          const meta = ALERT_SEVERITY_META[a.severity];
          return (
            <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-2xl border-b border-[rgba(60,70,110,.06)] px-4 py-4">
              <span className="h-2.5 w-2.5 flex-none rounded-full shadow-[0_0_0_4px_rgba(0,0,0,.03)]" style={{ background: meta.dot }} />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2.5">
                  <span className="text-sm font-semibold">{a.title}</span>
                  <span className="rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[.04em]" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                </div>
                <div className="text-[12.5px] text-faint">{a.meta}</div>
              </div>
              <span className="flex-none text-xs text-faint md:ml-auto">{timeAgo(a.createdAt)}</span>
              <button className="icon-btn flex-none rounded-[11px] px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft">Review</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
