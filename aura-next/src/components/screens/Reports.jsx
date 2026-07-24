import { reportCards } from '../../lib/data.js';

export default function Reports() {
  return (
    <div className="grid animate-fade-up grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reportCards.map((r, i) => (
        <div key={i} className="glass-card flex flex-col p-4">
          <div
            className="mb-4 flex h-[118px] items-end rounded-2xl border border-white/60 p-3.5"
            style={{ background: 'repeating-linear-gradient(135deg,rgba(79,140,255,.09) 0 10px,rgba(79,140,255,.03) 10px 20px)' }}
          >
            <svg viewBox="0 0 200 60" className="h-[46px] w-full">
              <path d="M0,50 C40,44 60,20 100,26 C140,32 160,10 200,16" fill="none" stroke="#4f8cff" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0,55 C40,52 70,42 110,44 C150,46 170,34 200,38" fill="none" stroke="#46d2c8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="mb-1.5 text-[15px] font-semibold">{r.title}</h3>
          <p className="mb-4 flex-1 text-[12.5px] leading-relaxed text-body">{r.desc}</p>
          <div className="flex items-center justify-between border-t border-[rgba(60,70,110,.08)] pt-3.5">
            <span className="text-[11.5px] text-faint"><span className="font-semibold text-muted">{r.freq}</span> · updated {r.updated}</span>
            <button className="btn-outline px-3.5 py-2 text-[12.5px] font-semibold text-brand">Open</button>
          </div>
        </div>
      ))}
    </div>
  );
}
