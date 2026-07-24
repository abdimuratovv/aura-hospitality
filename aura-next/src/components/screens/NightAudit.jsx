const checklist = [
  { icon: '✓', iconC: 'text-success bg-success-bg', label: <>Room &amp; tax revenue posted</>, meta: '03:41', metaC: 'text-faint', shade: false },
  { icon: '✓', iconC: 'text-success bg-success-bg', label: <>City ledger reconciled</>, meta: '03:47', metaC: 'text-faint', shade: true },
  { icon: '✓', iconC: 'text-success bg-success-bg', label: <>Comp &amp; house accounts verified</>, meta: '03:52', metaC: 'text-faint', shade: false },
  { icon: '!', iconC: 'text-warning bg-[rgba(214,158,46,.18)]', label: <>Deposits ledger <span className="text-warning">— $630 unmatched</span></>, meta: 'Review', metaC: 'font-semibold text-warning', shade: 'warn' },
  { icon: '!', iconC: 'text-critical bg-critical-bg', label: <>Cash drawer close <span className="text-critical">— $610 short</span></>, meta: 'Investigate', metaC: 'font-semibold text-critical', shade: 'crit' },
  { icon: '○', iconC: 'text-faint bg-[rgba(60,70,110,.1)]', label: 'Generate manager report', meta: 'Pending', metaC: 'text-faint', shade: false, dim: true },
];

export default function NightAudit() {
  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Close Status</span>
          <div className="mt-3 text-[28px] font-semibold tracking-[-.02em]">6 <span className="text-lg text-faint">/ 9 steps</span></div>
          <div className="mt-3.5 h-[7px] overflow-hidden rounded-[5px] bg-[rgba(60,70,110,.1)]">
            <div className="h-full w-[66%] rounded-[5px]" style={{ background: 'linear-gradient(90deg,#7dabff,#4f8cff)' }} />
          </div>
          <div className="mt-2.5 text-xs text-faint">Est. completion 04:20 local</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Open Discrepancies</span>
          <div className="mt-3 text-[28px] font-semibold tracking-[-.02em]">3</div>
          <div className="mt-3.5 flex gap-2"><span className="rounded-lg bg-critical-bg px-2 py-0.5 text-xs font-semibold text-critical">$1,240 net variance</span></div>
          <div className="mt-2.5 text-xs text-faint">Deposits &amp; cash drawer</div>
        </div>
        <div className="glass-card p-5">
          <span className="text-[12.5px] font-semibold text-body">Revenue Posted</span>
          <div className="mt-3 text-[28px] font-semibold tracking-[-.02em]">$612,480</div>
          <div className="mt-3.5 flex gap-2"><span className="rounded-lg bg-success-bg px-2 py-0.5 text-xs font-semibold text-success">Balanced to ledger</span></div>
          <div className="mt-2.5 text-xs text-faint">1,284 transactions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-card p-6">
          <h3 className="mb-4.5 text-base font-semibold">Reconciliation Checklist</h3>
          <div className="flex flex-col gap-0.5">
            {checklist.map((row, i) => (
              <div
                key={i}
                className={`flex items-center gap-3.5 rounded-2xl px-3 py-3 ${row.dim ? 'opacity-50' : ''} ${row.shade === true ? 'bg-[rgba(20,30,70,.035)]' : ''} ${row.shade === 'warn' ? 'border border-[rgba(214,158,46,.18)] bg-[rgba(214,158,46,.07)]' : ''} ${row.shade === 'crit' ? 'border border-[rgba(229,86,63,.16)] bg-[rgba(229,86,63,.06)]' : ''}`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[13px] ${row.iconC}`}>{row.icon}</span>
                <span className="flex-1 text-sm font-medium">{row.label}</span>
                <span className={`text-xs ${row.metaC}`}>{row.meta}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card flex flex-col p-6">
          <h3 className="mb-1 text-base font-semibold">Close Progress</h3>
          <p className="mb-5 text-[12.5px] text-faint">Night of Jul 22, 2026</p>
          <div className="grid flex-1 place-items-center">
            <svg viewBox="0 0 160 160" className="h-[150px] w-[150px]">
              <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(60,70,110,.1)" strokeWidth="14" />
              <circle cx="80" cy="80" r="66" fill="none" stroke="#4f8cff" strokeWidth="14" strokeLinecap="round" strokeDasharray="414.7" strokeDashoffset="141" transform="rotate(-90 80 80)" />
              <text x="80" y="76" textAnchor="middle" fontSize="30" fontWeight="600" fill="#26241f">66%</text>
              <text x="80" y="98" textAnchor="middle" fontSize="12" fill="#726f69">complete</text>
            </svg>
          </div>
          <button className="btn-primary mt-3 w-full py-3.5 text-sm">Resume close</button>
        </div>
      </div>
    </div>
  );
}
