'use client';

import { useEffect, useState } from 'react';
import { RISK_BAND_META, formatRelativeDay, initialsFromName } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

export default function Employees({ activePropertyId }) {
  const { t } = useLanguage();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);
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
        const res = await fetch(`/api/employees${qs}`);
        if (!res.ok) throw new Error('Failed to load employees');
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

  return (
    <div className="animate-fade-up">
      <div className="glass-card overflow-hidden">
        <div className="table-scroll">
          <div className="table-min">
            <div
              className="grid grid-cols-[1.8fr_1.1fr_1fr_1.4fr_.8fr] gap-3 border-b border-[rgba(var(--tint-ink),.08)] px-5.5 py-4 text-[11.5px] font-semibold uppercase tracking-[.04em] text-faint"
              style={{ background: 'linear-gradient(145deg,rgba(var(--tint-ink),.035),rgba(var(--tint-ink),.008))' }}
            >
              <span>{t('employees.employee')}</span><span>{t('employees.property')}</span><span>{t('employees.lastActivity')}</span><span>{t('employees.riskScore')}</span><span className="text-right">{t('employees.band')}</span>
            </div>

            {error && <div className="px-5.5 py-6 text-sm text-critical">{t('common.loadError')}</div>}
            {!error && !rows && <div className="px-5.5 py-6 text-sm text-faint">{t('common.loading')}</div>}

            {rows?.map((e) => {
              const band = RISK_BAND_META[e.band];
              return (
                <div key={e.id} className="grid grid-cols-[1.8fr_1.1fr_1fr_1.4fr_.8fr] items-center gap-3 border-b border-[rgba(var(--tint-slate),.06)] px-5.5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[13px] font-semibold text-white"
                      style={{ background: 'linear-gradient(160deg,#8fb0ff,#7dabff)' }}
                    >
                      {initialsFromName(e.name)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{e.name}</div>
                      <div className="text-xs text-faint">{e.role}</div>
                    </div>
                  </div>
                  <span className="text-[13px] text-muted">{e.property.name}</span>
                  <span className="text-[13px] text-muted">{formatRelativeDay(e.lastActivityAt, t)}</span>
                  <span className="flex items-center gap-2.5">
                    <span className="h-[7px] flex-1 overflow-hidden rounded bg-[rgba(var(--tint-slate),.1)]">
                      <span className="block h-full rounded" style={{ width: `${e.riskScore}%`, background: 'linear-gradient(90deg,#5fbf99,#e0c65a,#e5563f)' }} />
                    </span>
                    <span className="w-6 text-[12.5px] font-semibold">{e.riskScore}</span>
                  </span>
                  <span className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ color: band.color, background: band.bg }}>{t(band.label)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
