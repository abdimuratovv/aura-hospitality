import { leakRows } from '../../lib/data.js';

export default function RevenueLeakage() {
  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Identified This Cycle</span>
          <div className="mt-3 text-[28px] font-semibold">$184,410</div>
          <div className="mt-3 text-xs text-faint">across 5 categories</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Recovered</span>
          <div className="mt-3 text-[28px] font-semibold text-success">$71,340</div>
          <div className="mt-3 text-xs text-faint">posted back to ledger</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Recovery Rate</span>
          <div className="mt-3 text-[28px] font-semibold">38.7%</div>
          <div className="mt-3.5 h-[7px] overflow-hidden rounded-[5px] bg-[rgba(60,70,110,.1)]">
            <div className="h-full w-[38.7%] rounded-[5px]" style={{ background: 'linear-gradient(90deg,#5fbf99,#1f9268)' }} />
          </div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="mb-1 text-base font-semibold">Leakage by Category</h3>
        <p className="mb-5.5 text-[12.5px] text-faint">Identified value · current billing cycle</p>
        <div className="flex flex-col gap-5">
          {leakRows.map((l, i) => (
            <div key={i}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[13.5px] font-medium text-ink">{l.cat}</span>
                <span className="text-[13.5px] font-semibold">{l.amt} <span className="text-xs font-medium text-faint">· {l.pct}</span></span>
              </div>
              <div className="h-3 overflow-hidden rounded-[7px] bg-[rgba(60,70,110,.08)]">
                <div className="h-full rounded-[7px] shadow-[inset_0_1px_1px_rgba(255,255,255,.5)]" style={{ width: l.w, background: 'linear-gradient(90deg,#7dabff,#46d2c8)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
