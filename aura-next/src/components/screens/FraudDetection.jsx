'use client';

import { useEffect, useState } from 'react';
import { FRAUD_SEVERITY_META, formatAmount } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

const OPEN_STATUSES = ['OPEN', 'INVESTIGATING'];

export default function FraudDetection({ activePropertyId }) {
  const { t } = useLanguage();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [loadedFor, setLoadedFor] = useState(activePropertyId);

  if (loadedFor !== activePropertyId) {
    setLoadedFor(activePropertyId);
    setRows(null);
  }

  useEffect(() => {
    let cancelled = false;
    const qs = activePropertyId ? `?propertyId=${activePropertyId}` : '';
    async function load() {
      try {
        const res = await fetch(`/api/fraud-cases${qs}`);
        if (!res.ok) throw new Error('Failed to load fraud cases');
        const json = await res.json();
        if (cancelled) return;
        setRows(json.rows);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activePropertyId]);

  const STATUS_LABEL = {
    OPEN: t('fraud.statusOpen'),
    INVESTIGATING: t('fraud.statusInvestigating'),
    RESOLVED: t('fraud.statusResolved'),
    FALSE_POSITIVE: t('fraud.statusFalsePositive'),
  };
  const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

  async function updateStatus(id, status) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/fraud-cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update case');
      const updated = await res.json();
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      // leave row as-is; user can retry
    } finally {
      setUpdatingId(null);
    }
  }

  const openRows = rows?.filter((r) => OPEN_STATUSES.includes(r.status)) ?? [];
  const critical = openRows.filter((r) => r.severity === 'CRITICAL').length;
  const high = openRows.filter((r) => r.severity === 'HIGH').length;
  const medium = openRows.filter((r) => r.severity === 'MEDIUM').length;
  const amountAtRisk = openRows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">{t('fraud.openCases')}</span>
          <div className="mt-3 text-[28px] font-semibold">{rows ? openRows.length : '—'}</div>
          <div className="mt-3 text-xs text-faint">{t('fraud.countsLine', { critical, high, medium })}</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">{t('fraud.amountAtRisk')}</span>
          <div className="mt-3 text-[28px] font-semibold">{formatAmount(amountAtRisk)}</div>
          <div className="mt-3 text-xs text-faint">{t('fraud.acrossOpenCases', { n: openRows.length })}</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">{t('fraud.modelPrecision')}</span>
          <div className="mt-3 text-[28px] font-semibold">94.6%</div>
          <div className="mt-3 text-xs text-faint">{t('fraud.last30Days')}</div>
        </div>
      </div>

      <div className="glass-card p-2 pb-3">
        <div className="flex flex-wrap items-center gap-2.5 p-4 pb-3.5">
          <h3 className="flex-1 text-base font-semibold">{t('fraud.openInvestigations')}</h3>
          <span className="rounded-[11px] bg-info-bg px-3 py-1.5 text-[12.5px] font-medium text-brand">{t('fraud.allSeverities')}</span>
          <span className="rounded-[11px] border border-[rgba(60,70,110,.14)] px-3 py-1.5 text-[12.5px] font-medium text-body">{t('fraud.sortConfidence')}</span>
        </div>
        <div className="table-scroll">
          <div className="table-min">
            <div className="grid grid-cols-[1fr_1.2fr_.8fr_.7fr_.9fr_.7fr_1fr] gap-3 border-b border-[rgba(60,70,110,.1)] px-4.5 pb-2.5 text-[11.5px] font-semibold uppercase tracking-[.04em] text-faint">
              <span>{t('fraud.severity')}</span><span>{t('fraud.pattern')}</span><span>{t('fraud.agent')}</span><span>{t('fraud.property')}</span><span>{t('fraud.confidence')}</span><span className="text-right">{t('fraud.amount')}</span><span className="text-right">{t('fraud.status')}</span>
            </div>

            {error && <div className="px-4.5 py-6 text-sm text-critical">{t('common.loadError')}</div>}
            {!error && !rows && <div className="px-4.5 py-6 text-sm text-faint">{t('common.loading')}</div>}

            {rows?.map((r) => {
              const meta = FRAUD_SEVERITY_META[r.severity];
              return (
                <div key={r.id} className="grid grid-cols-[1fr_1.2fr_.8fr_.7fr_.9fr_.7fr_1fr] items-center gap-3 border-b border-[rgba(60,70,110,.06)] px-4.5 py-3.5">
                  <span className="justify-self-start rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ color: meta.color, background: meta.bg }}>{t(meta.label)}</span>
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
                  <select
                    value={r.status}
                    disabled={updatingId === r.id}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="justify-self-end rounded-lg border border-[rgba(60,70,110,.14)] bg-transparent px-2 py-1.5 text-[12px] font-medium text-body disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
