'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon.jsx';
import { formatTime, formatAmount, amountColor, FLAG_META } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

const pageBtnBase = 'flex h-8 w-8 items-center justify-center rounded-[10px] text-[13px] cursor-pointer';
const PAGE_SIZE = 8;

export default function Transactions({ activePropertyId, properties, onPropertyChange }) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [type, setType] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (activePropertyId) params.set('propertyId', activePropertyId);
    if (type) params.set('type', type);
    if (flaggedOnly) params.set('flag', 'FLAGGED');
    if (debouncedQ) params.set('q', debouncedQ);

    async function load() {
      try {
        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load transactions');
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, activePropertyId, type, flaggedOnly, debouncedQ]);

  function selectProperty(id) {
    setPage(1);
    onPropertyChange?.(id || null);
  }
  function selectType(v) {
    setPage(1);
    setType(v);
  }
  function toggleFlagged() {
    setPage(1);
    setFlaggedOnly((f) => !f);
  }

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const types = data?.types ?? [];
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="soft-input flex min-w-[220px] flex-1 items-center gap-2.5 px-3.5 py-2.5">
          <Icon name="search" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('transactions.searchPlaceholder')}
            className="w-full border-none bg-transparent text-[13.5px] text-ink outline-none"
          />
        </div>
        <select value={activePropertyId ?? ''} onChange={(e) => selectProperty(e.target.value)} className="pill px-4 py-2.5 text-sm">
          <option value="">{t('transactions.allProperties')}</option>
          {properties?.map((p) => (
            <option key={p.id} value={p.id}>{p.shortName}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => selectType(e.target.value)} className="pill px-4 py-2.5 text-sm">
          <option value="">{t('transactions.allTypes')}</option>
          {types.map((tp) => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>
        <span
          onClick={toggleFlagged}
          className={
            flaggedOnly
              ? 'cursor-pointer rounded-xl border border-[rgba(var(--critical-rgb),.2)] bg-[rgba(var(--critical-rgb),.1)] px-4 py-2.5 text-sm font-semibold text-critical'
              : 'pill px-4 py-2.5 text-sm'
          }
        >
          {t('transactions.flaggedOnly')}
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="table-scroll">
          <div className="table-min">
            <div
              className="grid grid-cols-[.9fr_.6fr_1fr_1fr_.9fr_.8fr_.8fr] gap-3 border-b border-[rgba(var(--tint-ink),.08)] px-5 py-4 text-[11.5px] font-semibold uppercase tracking-[.04em] text-faint"
              style={{ background: 'linear-gradient(145deg,rgba(var(--tint-ink),.035),rgba(var(--tint-ink),.008))' }}
            >
              <span>{t('transactions.folio')}</span><span>{t('transactions.time')}</span><span>{t('transactions.type')}</span><span>{t('transactions.property')}</span><span>{t('transactions.agent')}</span><span className="text-right">{t('transactions.amount')}</span><span className="text-right">{t('transactions.status')}</span>
            </div>

            {error && <div className="px-5 py-6 text-sm text-critical">{t('common.loadError')}</div>}

            {!error && !data && (
              <div className="px-5 py-6 text-sm text-faint">{t('common.loading')}</div>
            )}

            {!error && data && rows.length === 0 && (
              <div className="px-5 py-6 text-sm text-faint">{t('transactions.noResults')}</div>
            )}

            {rows.map((tx) => {
              const flag = FLAG_META[tx.flag];
              return (
                <div key={tx.id} className="grid grid-cols-[.9fr_.6fr_1fr_1fr_.9fr_.8fr_.8fr] items-center gap-3 border-b border-[rgba(var(--tint-slate),.06)] px-5 py-3.5">
                  <span className="font-mono text-[13px] font-semibold">#{tx.folioId}</span>
                  <span className="text-[13px] text-body">{formatTime(tx.postedAt)}</span>
                  <span className="text-[13.5px] font-medium">{tx.type}</span>
                  <span className="text-[13px] text-muted">{tx.property.name}</span>
                  <span className="text-[13px] text-muted">{tx.agent}</span>
                  <span className="text-right text-[13.5px] font-semibold" style={{ color: amountColor(tx.amount) }}>{formatAmount(tx.amount)}</span>
                  <span className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ color: flag.color, background: flag.bg }}>{t(flag.label)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-4">
          <span className="text-[12.5px] text-faint">
            {total > 0 ? t('transactions.showing', { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, total), total }) : ''}
          </span>
          <div className="flex gap-1.5">
            <span
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`${pageBtnBase} border border-white/[.16] text-faint ${page === 1 ? 'opacity-40' : ''}`}
              style={{ background: 'linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.01) 60%)' }}
            >
              ‹
            </span>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <span
                key={n}
                onClick={() => setPage(n)}
                className={n === page ? `${pageBtnBase} font-semibold text-white` : `${pageBtnBase} border border-white/[.16] text-muted`}
                style={n === page ? { background: 'linear-gradient(160deg,#7dabff,#4f8cff)' } : { background: 'linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.01) 60%)' }}
              >
                {n}
              </span>
            ))}
            <span
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className={`${pageBtnBase} border border-white/[.16] text-muted ${page === pageCount ? 'opacity-40' : ''}`}
              style={{ background: 'linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.01) 60%)' }}
            >
              ›
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
