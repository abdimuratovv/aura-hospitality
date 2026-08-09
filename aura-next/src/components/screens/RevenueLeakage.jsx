'use client';

import { useEffect, useState } from 'react';
import { formatAmount } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

export default function RevenueLeakage({ activePropertyId }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loadedFor, setLoadedFor] = useState(activePropertyId);

  if (loadedFor !== activePropertyId) {
    setLoadedFor(activePropertyId);
    setData(null);
  }

  useEffect(() => {
    let cancelled = false;
    const qs = activePropertyId ? `?propertyId=${activePropertyId}` : '';
    fetch(`/api/leakage${qs}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load leakage data');
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activePropertyId]);

  const maxPct = data?.categories.length ? Math.max(...data.categories.map((c) => c.pct)) : 1;

  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">{t('leakage.identifiedThisCycle')}</span>
          <div className="mt-3 text-[28px] font-semibold">{data ? formatAmount(data.identified) : '—'}</div>
          <div className="mt-3 text-xs text-faint">{t('leakage.acrossCategories', { n: data?.categories.length ?? 0 })}</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">{t('leakage.recovered')}</span>
          <div className="mt-3 text-[28px] font-semibold text-success">{data ? formatAmount(data.recovered) : '—'}</div>
          <div className="mt-3 text-xs text-faint">{t('leakage.postedBackToLedger')}</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">{t('leakage.recoveryRate')}</span>
          <div className="mt-3 text-[28px] font-semibold">{data?.recoveryRatePct ?? '—'}%</div>
          <div className="mt-3.5 h-[7px] overflow-hidden rounded-[5px] bg-[rgba(var(--tint-slate),.1)]">
            <div className="h-full rounded-[5px]" style={{ width: `${data?.recoveryRatePct ?? 0}%`, background: 'linear-gradient(90deg,#5fbf99,#1f9268)' }} />
          </div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="mb-1 text-base font-semibold">{t('leakage.leakageByCategory')}</h3>
        <p className="mb-5.5 text-[12.5px] text-faint">{t('leakage.identifiedValueCycle')}</p>

        {error && <div className="text-sm text-critical">{t('common.loadError')}</div>}
        {!error && !data && <div className="text-sm text-faint">{t('common.loading')}</div>}

        <div className="flex flex-col gap-5">
          {data?.categories.map((l) => (
            <div key={l.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13.5px] font-medium text-ink">{l.category}</span>
                <span className="text-[13.5px] font-semibold">{formatAmount(l.amount)} <span className="text-xs font-medium text-faint">· {l.pct}%</span></span>
              </div>
              <div className="h-3 overflow-hidden rounded-[7px] bg-[rgba(var(--tint-slate),.08)]">
                <div
                  className="relative h-full rounded-[7px] shadow-[inset_0_1px_1px_rgba(255,255,255,.5)]"
                  style={{ width: `${(l.pct / maxPct) * 100}%`, background: 'linear-gradient(90deg,#7dabff,#46d2c8)' }}
                >
                  <div className="absolute inset-y-0 left-0 rounded-[7px] bg-[rgba(var(--success-rgb),.55)]" style={{ width: `${Math.min(100, l.recoveryRatePct)}%` }} />
                </div>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between text-[11px] text-faint">
                <span>{t('leakage.recoveredLine', { amount: formatAmount(l.recovered) })}</span>
                <span>{t('leakage.ofIdentified', { pct: l.recoveryRatePct })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
