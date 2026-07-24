import { empRows } from '../../lib/data.js';

export default function Employees() {
  return (
    <div className="animate-fade-up">
      <div className="glass-card overflow-hidden">
        <div className="table-scroll">
          <div className="table-min">
            <div
              className="grid grid-cols-[1.8fr_1.1fr_1fr_1.4fr_.8fr] gap-3 border-b border-[rgba(20,30,70,.08)] px-5.5 py-4 text-[11.5px] font-semibold uppercase tracking-[.04em] text-faint"
              style={{ background: 'linear-gradient(145deg,rgba(20,30,70,.035),rgba(20,30,70,.008))' }}
            >
              <span>Employee</span><span>Property</span><span>Last activity</span><span>Risk score</span><span className="text-right">Band</span>
            </div>
            {empRows.map((e, i) => (
              <div key={i} className="grid grid-cols-[1.8fr_1.1fr_1fr_1.4fr_.8fr] items-center gap-3 border-b border-[rgba(60,70,110,.06)] px-5.5 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[13px] font-semibold text-white"
                    style={{ background: 'linear-gradient(160deg,#8fb0ff,#7dabff)' }}
                  >
                    {e.init}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{e.name}</div>
                    <div className="text-xs text-faint">{e.role}</div>
                  </div>
                </div>
                <span className="text-[13px] text-muted">{e.prop}</span>
                <span className="text-[13px] text-muted">{e.last}</span>
                <span className="flex items-center gap-2.5">
                  <span className="h-[7px] flex-1 overflow-hidden rounded bg-[rgba(60,70,110,.1)]">
                    <span className="block h-full rounded" style={{ width: `${e.score}%`, background: 'linear-gradient(90deg,#5fbf99,#e0c65a,#e5563f)' }} />
                  </span>
                  <span className="w-6 text-[12.5px] font-semibold">{e.score}</span>
                </span>
                <span className="justify-self-end rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ color: e.bandC, background: e.bandBg }}>{e.band}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
