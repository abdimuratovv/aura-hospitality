'use client';

import { useEffect, useState } from 'react';
import { CHECKLIST_STATUS_META, formatAmount } from '../../lib/format.js';

function shadeClass(status) {
  if (status === 'WARNING') return 'border border-[rgba(214,158,46,.18)] bg-[rgba(214,158,46,.07)]';
  if (status === 'CRITICAL') return 'border border-[rgba(229,86,63,.16)] bg-[rgba(229,86,63,.06)]';
  return '';
}

export default function NightAudit() {
  const [run, setRun] = useState(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetch('/api/night-audit')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load night audit data');
        return res.json();
      })
      .then((json) => setRun(json.run))
      .catch((err) => setError(err.message));
  }, []);

  async function markDone(id) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/night-audit/checklist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' }),
      });
      if (!res.ok) throw new Error('Failed to update checklist item');
      const json = await res.json();
      setRun(json.run);
    } catch {
      // leave item as-is; user can retry
    } finally {
      setUpdatingId(null);
    }
  }

  if (error) return <div className="text-sm text-critical">{error}</div>;
  if (!run) return <div className="text-sm text-faint">Loading…</div>;

  const closePct = Math.round((run.closeStepsCompleted / run.closeStepsTotal) * 100);
  const circumference = 2 * Math.PI * 66;
  const dashOffset = circumference * (1 - run.closeProgressPct / 100);

  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Close Status</span>
          <div className="mt-3 text-[28px] font-semibold tracking-[-.02em]">{run.closeStepsCompleted} <span className="text-lg text-faint">/ {run.closeStepsTotal} steps</span></div>
          <div className="mt-3.5 h-[7px] overflow-hidden rounded-[5px] bg-[rgba(60,70,110,.1)]">
            <div className="h-full rounded-[5px]" style={{ width: `${closePct}%`, background: 'linear-gradient(90deg,#7dabff,#4f8cff)' }} />
          </div>
          <div className="mt-2.5 text-xs text-faint">Est. completion {run.estCompletionLabel}</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Open Discrepancies</span>
          <div className="mt-3 text-[28px] font-semibold tracking-[-.02em]">{run.openDiscrepancies}</div>
          <div className="mt-3.5 flex gap-2"><span className="rounded-lg bg-critical-bg px-2 py-0.5 text-xs font-semibold text-critical">{formatAmount(run.discrepancyAmount)} net variance</span></div>
          <div className="mt-2.5 text-xs text-faint">Deposits &amp; cash drawer</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Revenue Posted</span>
          <div className="mt-3 text-[28px] font-semibold tracking-[-.02em]">{formatAmount(run.revenuePosted)}</div>
          <div className="mt-3.5 flex gap-2"><span className="rounded-lg bg-success-bg px-2 py-0.5 text-xs font-semibold text-success">Balanced to ledger</span></div>
          <div className="mt-2.5 text-xs text-faint">{run.transactionCount.toLocaleString('en-US')} transactions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-card p-6">
          <h3 className="mb-4.5 text-base font-semibold">Reconciliation Checklist</h3>
          <div className="flex flex-col gap-0.5">
            {run.checklist.map((row) => {
              const meta = CHECKLIST_STATUS_META[row.status];
              return (
                <div key={row.id} className={`flex items-center gap-3.5 rounded-2xl px-3 py-3 ${row.status === 'PENDING' ? 'opacity-50' : ''} ${shadeClass(row.status)}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[13px] ${meta.iconC}`}>{meta.icon}</span>
                  <span className="flex-1 text-sm font-medium">
                    {row.label}
                    {row.detail && <span className={row.status === 'WARNING' ? 'text-warning' : 'text-critical'}> — {row.detail}</span>}
                  </span>
                  <span className={`text-xs ${row.status === 'WARNING' ? 'font-semibold text-warning' : row.status === 'CRITICAL' ? 'font-semibold text-critical' : 'text-faint'}`}>{row.meta}</span>
                  {row.status !== 'DONE' && (
                    <button
                      onClick={() => markDone(row.id)}
                      disabled={updatingId === row.id}
                      className="icon-btn flex-none rounded-[10px] px-3 py-1.5 text-[12px] font-semibold text-ink-soft disabled:opacity-50"
                    >
                      {updatingId === row.id ? 'Saving…' : 'Mark done'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-card flex flex-col p-6">
          <h3 className="mb-1 text-base font-semibold">Close Progress</h3>
          <p className="mb-5 text-[12.5px] text-faint">Night of {new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <div className="grid flex-1 place-items-center">
            <svg viewBox="0 0 160 160" className="h-[150px] w-[150px]">
              <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(60,70,110,.1)" strokeWidth="14" />
              <circle
                cx="80" cy="80" r="66" fill="none" stroke="#4f8cff" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circumference.toFixed(1)} strokeDashoffset={dashOffset.toFixed(1)} transform="rotate(-90 80 80)"
              />
              <text x="80" y="76" textAnchor="middle" fontSize="30" fontWeight="600" fill="#26241f">{run.closeProgressPct}%</text>
              <text x="80" y="98" textAnchor="middle" fontSize="12" fill="#726f69">complete</text>
            </svg>
          </div>
          <button className="btn-primary mt-3 w-full py-3.5 text-sm">Resume close</button>
        </div>
      </div>
    </div>
  );
}
