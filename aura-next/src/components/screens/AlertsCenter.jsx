'use client';

import { useEffect, useState } from 'react';
import { ALERT_SEVERITY_META, timeAgo } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

const NEXT_STATUS = { OPEN: 'ACKNOWLEDGED', ACKNOWLEDGED: 'RESOLVED' };

const SEVERITIES = ['CRITICAL', 'WARNING', 'INFO'];

export default function AlertsCenter({ activePropertyId }) {
  const { t } = useLanguage();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
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
        const res = await fetch(`/api/alerts${qs}`);
        if (!res.ok) throw new Error('Failed to load alerts');
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

  const ACTION_LABEL = { OPEN: t('alertsCenter.acknowledge'), ACKNOWLEDGED: t('alertsCenter.resolve') };

  async function advance(alert) {
    const nextStatus = NEXT_STATUS[alert.status];
    if (!nextStatus) return;
    setUpdatingId(alert.id);
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update alert');
      const updated = await res.json();
      setRows((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      // leave row as-is; user can retry
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = { CRITICAL: 0, WARNING: 0, INFO: 0 };
  for (const a of rows ?? []) counts[a.severity] = (counts[a.severity] ?? 0) + 1;
  const total = rows?.length ?? 0;
  const visibleRows = severityFilter ? rows?.filter((a) => a.severity === severityFilter) : rows;

  const activePillClass = 'cursor-pointer rounded-xl border border-white/80 px-4 py-2.5 text-sm font-semibold text-brand';
  const activePillStyle = { background: 'linear-gradient(150deg,rgba(255,255,255,.95),rgba(255,255,255,.55))', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.9),0 8px 18px -12px rgba(79,140,255,.5)' };

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          onClick={() => setSeverityFilter(null)}
          className={!severityFilter ? activePillClass : 'pill px-4 py-2.5 text-sm'}
          style={!severityFilter ? activePillStyle : undefined}
        >
          {t('alertsCenter.all')} · {total}
        </span>
        {SEVERITIES.map((sev) => (
          <span
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={severityFilter === sev ? activePillClass : 'pill px-4 py-2.5 text-sm'}
            style={severityFilter === sev ? activePillStyle : undefined}
          >
            {t(`status.${sev.toLowerCase()}`)} · {counts[sev]}
          </span>
        ))}
      </div>
      <div className="glass-card p-2">
        {error && <div className="px-4 py-6 text-sm text-critical">{t('common.loadError')}</div>}
        {!error && !rows && <div className="px-4 py-6 text-sm text-faint">{t('common.loading')}</div>}
        {!error && rows && visibleRows.length === 0 && <div className="px-4 py-6 text-sm text-faint">{t('alertsCenter.noMatch')}</div>}

        {visibleRows?.map((a) => {
          const meta = ALERT_SEVERITY_META[a.severity];
          const actionLabel = ACTION_LABEL[a.status];
          return (
            <div key={a.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border-b border-[rgba(60,70,110,.06)] px-4 py-4 ${a.status === 'RESOLVED' ? 'opacity-55' : ''}`}>
              <span className="h-2.5 w-2.5 flex-none rounded-full shadow-[0_0_0_4px_rgba(0,0,0,.03)]" style={{ background: meta.dot }} />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2.5">
                  <span className="text-sm font-semibold">{a.title}</span>
                  <span className="rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[.04em]" style={{ color: meta.color, background: meta.bg }}>{t(meta.label)}</span>
                </div>
                <div className="text-[12.5px] text-faint">{a.meta}</div>
              </div>
              <span className="flex-none text-xs text-faint md:ml-auto">{timeAgo(a.createdAt, t)}</span>
              {actionLabel ? (
                <button
                  onClick={() => advance(a)}
                  disabled={updatingId === a.id}
                  className="icon-btn flex-none rounded-[11px] px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft disabled:opacity-50"
                >
                  {updatingId === a.id ? t('common.saving') : actionLabel}
                </button>
              ) : (
                <span className="flex-none rounded-[11px] px-3.5 py-2 text-[12.5px] font-semibold text-success">{t('common.resolved')}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
