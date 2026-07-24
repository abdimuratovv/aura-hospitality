import { alertRows } from '../../lib/data.js';

export default function AlertsCenter() {
  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className="cursor-pointer rounded-xl border border-white/80 px-4 py-2.5 text-sm font-semibold text-brand"
          style={{ background: 'linear-gradient(150deg,rgba(255,255,255,.95),rgba(255,255,255,.55))', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.9),0 8px 18px -12px rgba(79,140,255,.5)' }}
        >
          All · 7
        </span>
        <span className="pill px-4 py-2.5 text-sm">Critical · 3</span>
        <span className="pill px-4 py-2.5 text-sm">Warning · 2</span>
        <span className="pill px-4 py-2.5 text-sm">Info · 2</span>
      </div>
      <div className="glass-card p-2">
        {alertRows.map((a, i) => (
          <div key={i} className="flex flex-wrap items-center gap-4 rounded-2xl border-b border-[rgba(60,70,110,.06)] px-4 py-4">
            <span className="h-2.5 w-2.5 flex-none rounded-full shadow-[0_0_0_4px_rgba(0,0,0,.03)]" style={{ background: a.dot }} />
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2.5">
                <span className="text-sm font-semibold">{a.title}</span>
                <span className="rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[.04em]" style={{ color: a.tagC, background: a.tagBg }}>{a.tag}</span>
              </div>
              <div className="text-[12.5px] text-faint">{a.meta}</div>
            </div>
            <span className="flex-none text-xs text-faint md:ml-auto">{a.time}</span>
            <button className="icon-btn flex-none rounded-[11px] px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft">Review</button>
          </div>
        ))}
      </div>
    </div>
  );
}
