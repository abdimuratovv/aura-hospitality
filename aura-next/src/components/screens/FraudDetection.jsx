'use client';

import { useEffect, useState } from 'react';
import { FRAUD_SEVERITY_META, formatAmount } from '../../lib/format.js';

export default function FraudDetection() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/fraud-cases')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load fraud cases');
        return res.json();
      })
      .then((json) => setRows(json.rows))
      .catch((err) => setError(err.message));
  }, []);

  const critical = rows?.filter((r) => r.severity === 'CRITICAL').length ?? 0;
  const high = rows?.filter((r) => r.severity === 'HIGH').length ?? 0;
  const medium = rows?.filter((r) => r.severity === 'MEDIUM').length ?? 0;
  const amountAtRisk = rows?.reduce((sum, r) => sum + r.amount, 0) ?? 0;

  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Open Cases</span>
          <div className="mt-3 text-[28px] font-semibold">{rows?.length ?? '—'}</div>
          <div className="mt-3 text-xs text-faint"><span className="font-semibold text-critical">{critical} critical</span> · {high} high · {medium} medium</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Amount at Risk</span>
          <div className="mt-3 text-[28px] font-semibold">{formatAmount(amountAtRisk)}</div>
          <div className="mt-3 text-xs text-faint">across {rows?.length ?? 0} open cases</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Model Precision</span>
          <div className="mt-3 text-[28px] font-semibold">94.6%</div>
          <div className="mt-3 text-xs text-faint">last 30 days · 1.2% false positive</div>
        </div>
      </div>

      <div className="glass-card p-2 pb-3">
        <div className="flex flex-wrap items-center gap-2.5 p-4 pb-3.5">
          <h3 className="flex-1 text-base font-semibold">Open Investigations</h3>
          <span className="rounded-[11px] bg-info-bg px-3 py-1.5 text-[12.5px] font-medium text-brand">All severities</span>
          <span className="rounded-[11px] border border-[rgba(60,70,110,.14)] px-3 py-1.5 text-[12.5px] font-medium text-body">Sort: Confidence</span>
        </div>
        <div className="table-scroll">
          <div className="table-min">
            <div className="grid grid-cols-[1.1fr_1.3fr_.9fr_.8fr_1fr_.8fr] gap-3 border-b border-[rgba(60,70,110,.1)] px-4.5 pb-2.5 text-[11.5px] font-semibold uppercase tracking-[.04em] text-faint">
              <span>Severity</span><span>Pattern</span><span>Agent</span><span>Property</span><span>Confidence</span><span className="text-right">Amount</span>
            </div>

            {error && <div className="px-4.5 py-6 text-sm text-critical">{error}</div>}
            {!error && !rows && <div className="px-4.5 py-6 text-sm text-faint">Loading…</div>}

            {rows?.map((r) => {
              const meta = FRAUD_SEVERITY_META[r.severity];
              return (
                <div key={r.id} className="grid grid-cols-[1.1fr_1.3fr_.9fr_.8fr_1fr_.8fr] items-center gap-3 border-b border-[rgba(60,70,110,.06)] px-4.5 py-3.5">
                  <span className="justify-self-start rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                  <span className="text-[13.5px] font-medium text-ink">{r.pattern}</span>
                  <span className="text-[13px] text-muted">{r.agent}</span>
                  <span className="text-[13px] text-muted">{r.property.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded bg-[rgba(60,70,110,.12)]">
                      <span className="block h-full rounded" style={{ width: `${r.confidence}%`, background: 'linear-gradient(90deg,#7dabff,#4f8cff)' }} />
                    </span>
                    <span className="text-[11.5px] font-semibold text-body">{r.confidence}%</span>
                  </span>
                  <span className="text-right text-[13.5px] font-semibold">{formatAmount(r.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
