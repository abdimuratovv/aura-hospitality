'use client';

import { useEffect, useState } from 'react';
import { formatAmount } from '../../lib/format.js';

export default function RevenueLeakage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leakage')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load leakage data');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const maxPct = data?.categories.length ? Math.max(...data.categories.map((c) => c.pct)) : 1;

  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Identified This Cycle</span>
          <div className="mt-3 text-[28px] font-semibold">{data ? formatAmount(data.identified) : '—'}</div>
          <div className="mt-3 text-xs text-faint">across {data?.categories.length ?? 0} categories</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Recovered</span>
          <div className="mt-3 text-[28px] font-semibold text-success">{data ? formatAmount(data.recovered) : '—'}</div>
          <div className="mt-3 text-xs text-faint">posted back to ledger</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Recovery Rate</span>
          <div className="mt-3 text-[28px] font-semibold">{data?.recoveryRatePct ?? '—'}%</div>
          <div className="mt-3.5 h-[7px] overflow-hidden rounded-[5px] bg-[rgba(60,70,110,.1)]">
            <div className="h-full rounded-[5px]" style={{ width: `${data?.recoveryRatePct ?? 0}%`, background: 'linear-gradient(90deg,#5fbf99,#1f9268)' }} />
          </div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="mb-1 text-base font-semibold">Leakage by Category</h3>
        <p className="mb-5.5 text-[12.5px] text-faint">Identified value · current billing cycle</p>

        {error && <div className="text-sm text-critical">{error}</div>}
        {!error && !data && <div className="text-sm text-faint">Loading…</div>}

        <div className="flex flex-col gap-5">
          {data?.categories.map((l) => (
            <div key={l.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13.5px] font-medium text-ink">{l.category}</span>
                <span className="text-[13.5px] font-semibold">{formatAmount(l.amount)} <span className="text-xs font-medium text-faint">· {l.pct}%</span></span>
              </div>
              <div className="h-3 overflow-hidden rounded-[7px] bg-[rgba(60,70,110,.08)]">
                <div className="h-full rounded-[7px] shadow-[inset_0_1px_1px_rgba(255,255,255,.5)]" style={{ width: `${(l.pct / maxPct) * 100}%`, background: 'linear-gradient(90deg,#7dabff,#46d2c8)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
