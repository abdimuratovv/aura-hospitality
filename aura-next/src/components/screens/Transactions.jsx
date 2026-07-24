'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon.jsx';
import { formatTime, formatAmount, amountColor, FLAG_META } from '../../lib/format.js';

const pageBtnBase = 'flex h-8 w-8 items-center justify-center rounded-[10px] text-[13px] cursor-pointer';
const PAGE_SIZE = 8;

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    fetch(`/api/transactions?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load transactions');
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="soft-input flex min-w-[220px] flex-1 items-center gap-2.5 px-3.5 py-2.5">
          <Icon name="search" size={18} />
          <input placeholder="Filter by folio, agent or property…" className="w-full border-none bg-transparent text-[13.5px] text-ink outline-none" />
        </div>
        <span className="pill px-4 py-2.5 text-sm">All properties</span>
        <span className="pill px-4 py-2.5 text-sm">All types</span>
        <span className="cursor-pointer rounded-xl border border-[rgba(229,86,63,.2)] bg-[rgba(229,86,63,.1)] px-4 py-2.5 text-sm font-semibold text-critical">Flagged only</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="table-scroll">
          <div className="table-min">
            <div
              className="grid grid-cols-[.9fr_.6fr_1fr_1fr_.9fr_.8fr_.8fr] gap-3 border-b border-[rgba(20,30,70,.08)] px-5 py-4 text-[11.5px] font-semibold uppercase tracking-[.04em] text-faint"
              style={{ background: 'linear-gradient(145deg,rgba(20,30,70,.035),rgba(20,30,70,.008))' }}
            >
              <span>Folio</span><span>Time</span><span>Type</span><span>Property</span><span>Agent</span><span className="text-right">Amount</span><span className="text-right">Status</span>
            </div>

            {error && <div className="px-5 py-6 text-sm text-critical">{error}</div>}

            {!error && !data && (
              <div className="px-5 py-6 text-sm text-faint">Loading…</div>
            )}

            {!error && data && rows.length === 0 && (
              <div className="px-5 py-6 text-sm text-faint">No transactions found.</div>
            )}

            {rows.map((t) => {
              const flag = FLAG_META[t.flag];
              return (
                <div key={t.id} className="grid grid-cols-[.9fr_.6fr_1fr_1fr_.9fr_.8fr_.8fr] items-center gap-3 border-b border-[rgba(60,70,110,.06)] px-5 py-3.5">
                  <span className="font-mono text-[13px] font-semibold">#{t.folioId}</span>
                  <span className="text-[13px] text-body">{formatTime(t.postedAt)}</span>
                  <span className="text-[13.5px] font-medium">{t.type}</span>
                  <span className="text-[13px] text-muted">{t.property.name}</span>
                  <span className="text-[13px] text-muted">{t.agent}</span>
                  <span className="text-right text-[13.5px] font-semibold" style={{ color: amountColor(t.amount) }}>{formatAmount(t.amount)}</span>
                  <span className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ color: flag.color, background: flag.bg }}>{flag.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-4">
          <span className="text-[12.5px] text-faint">
            {total > 0 ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total} postings` : ''}
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
