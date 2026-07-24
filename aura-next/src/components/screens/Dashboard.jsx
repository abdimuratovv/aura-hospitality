import Icon from '../Icon.jsx';
import { heatData } from '../../lib/data.js';

function cellColor(v) {
  if (v < 0.33) return `rgba(95,191,153,${0.25 + v})`;
  if (v < 0.6) return `rgba(224,198,90,${0.3 + v * 0.5})`;
  return `rgba(229,86,63,${0.35 + v * 0.5})`;
}

function Heatmap() {
  return (
    <div className="flex flex-col gap-1.5">
      {heatData.map((row, ri) => (
        <div key={ri} className="grid grid-cols-[128px_1fr] items-center gap-2.5">
          <span className="truncate text-[11.5px] font-medium text-faint-2">{row[0]}</span>
          <div className="grid grid-cols-7 gap-1">
            {row[1].map((v, ci) => (
              <div
                key={ci}
                title={`${row[0]} · risk ${Math.round(v * 100)}`}
                className="h-[22px] rounded-md shadow-[inset_0_1px_1px_rgba(255,255,255,.5)]"
                style={{ background: cellColor(v) }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const statCards = [
  { label: 'Portfolio Revenue', icon: 'revenue', iconC: 'text-success', iconBg: 'bg-success-bg', value: '$4.82M', badge: '▲ 6.4%', badgeC: 'text-success', badgeBg: 'bg-success-bg', note: 'vs last week' },
  { label: 'Active Fraud Alerts', icon: 'shield', iconC: 'text-critical', iconBg: 'bg-critical-bg', value: '12', badge: '3 critical', badgeC: 'text-critical', badgeBg: 'bg-critical-bg', note: 'needs review' },
  { label: 'Revenue Leakage', icon: 'drop', iconC: 'text-warning', iconBg: 'bg-warning-bg', value: '$184K', badge: '$71K recovered', badgeC: 'text-warning', badgeBg: 'bg-warning-bg', note: '' },
  { label: 'Night Audit', icon: 'moon', iconC: 'text-brand', iconBg: 'bg-[rgba(79,140,255,.16)]', value: '98.2%', badge: 'Reconciled', badgeC: 'text-success', badgeBg: 'bg-success-bg', note: '3 exceptions' },
];

export default function Dashboard({ goAlerts }) {
  return (
    <div className="animate-fade-up">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold tracking-[.02em] text-body">{c.label}</span>
              <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-[9px] ${c.iconC} ${c.iconBg}`}>
                <Icon name={c.icon} size={16} />
              </span>
            </div>
            <div className="text-[30px] font-semibold leading-none tracking-[-.02em]">{c.value}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${c.badgeC} ${c.badgeBg}`}>{c.badge}</span>
              {c.note && <span className="text-xs text-faint">{c.note}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="glass-card p-6">
          <div className="mb-5.5 flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-base font-semibold">Revenue vs. Recovered Leakage</h3>
              <p className="text-[12.5px] text-faint">Last 12 weeks · all properties</p>
            </div>
            <div className="flex gap-4 text-xs text-body">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-teal" />Recovered</span>
            </div>
          </div>
          <svg viewBox="0 0 640 240" className="block w-full h-auto">
            <defs>
              <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4f8cff" stopOpacity=".28" /><stop offset="1" stopColor="#4f8cff" stopOpacity="0" /></linearGradient>
              <linearGradient id="aRec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#46d2c8" stopOpacity=".26" /><stop offset="1" stopColor="#46d2c8" stopOpacity="0" /></linearGradient>
            </defs>
            <line x1="0" y1="50" x2="640" y2="50" stroke="rgba(60,70,110,.08)" />
            <line x1="0" y1="110" x2="640" y2="110" stroke="rgba(60,70,110,.08)" />
            <line x1="0" y1="170" x2="640" y2="170" stroke="rgba(60,70,110,.08)" />
            <path d="M0,170 C50,160 90,130 140,138 C200,148 230,96 300,104 C360,110 380,66 440,74 C500,82 540,44 640,52 L640,240 L0,240 Z" fill="url(#aRev)" />
            <path d="M0,170 C50,160 90,130 140,138 C200,148 230,96 300,104 C360,110 380,66 440,74 C500,82 540,44 640,52" fill="none" stroke="#4f8cff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,206 C60,202 100,190 150,192 C210,194 250,172 310,176 C370,180 400,160 460,164 C520,168 560,150 640,154 L640,240 L0,240 Z" fill="url(#aRec)" />
            <path d="M0,206 C60,202 100,190 150,192 C210,194 250,172 310,176 C370,180 400,160 460,164 C520,168 560,150 640,154" fill="none" stroke="#46d2c8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="640" cy="52" r="4.5" fill="#4f8cff" stroke="#fff" strokeWidth="2" />
          </svg>
          <div className="mt-2.5 flex justify-between text-[11px] text-hairline">
            <span>Wk 1</span><span>Wk 3</span><span>Wk 5</span><span>Wk 7</span><span>Wk 9</span><span>Wk 11</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] text-white" style={{ background: 'linear-gradient(160deg,#7dabff,#7a6bff)' }}>
              <Icon name="spark" size={16} />
            </span>
            <h3 className="text-base font-semibold">AI Insights</h3>
          </div>
          <div className="flex flex-col gap-3.5">
            <div className="rounded-2xl border border-[rgba(229,86,63,.16)] bg-[rgba(229,86,63,.08)] p-3.5">
              <div className="mb-1 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-critical" /><span className="text-[11px] font-semibold uppercase tracking-[.04em] text-critical">Critical</span></div>
              <p className="text-[13px] leading-relaxed text-ink-soft">Voided-then-reposted folios at <b>The Grand Meridian</b> spiked 340% overnight — concentrated on 2 front-desk agents.</p>
            </div>
            <div className="rounded-2xl border border-[rgba(214,158,46,.16)] bg-[rgba(214,158,46,.08)] p-3.5">
              <div className="mb-1 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warning" /><span className="text-[11px] font-semibold uppercase tracking-[.04em] text-warning">Opportunity</span></div>
              <p className="text-[13px] leading-relaxed text-ink-soft">Unbilled minibar &amp; late-checkout fees across 3 properties total <b>$71K</b> recoverable this cycle.</p>
            </div>
            <div className="rounded-2xl border border-[rgba(79,140,255,.16)] bg-[rgba(79,140,255,.08)] p-3.5">
              <div className="mb-1 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-brand" /><span className="text-[11px] font-semibold uppercase tracking-[.04em] text-brand">Trend</span></div>
              <p className="text-[13px] leading-relaxed text-ink-soft">Comp-room approvals are trending down 12% — policy tightening is holding.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass-card p-6">
          <div className="mb-4.5 flex items-center justify-between">
            <h3 className="text-base font-semibold">Recent Alerts</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); goAlerts(); }} className="text-[12.5px] font-semibold">View all</a>
          </div>
          <div className="flex flex-col gap-1">
            {[
              { dot: 'bg-critical', title: 'Duplicate refund — $2,480', meta: 'Folio #GM-88213 · The Grand Meridian', time: '2m ago', shade: false },
              { dot: 'bg-warning', title: 'Cash variance at close — $610', meta: 'Front Desk · Meridian Bayside', time: '18m ago', shade: true },
              { dot: 'bg-critical', title: 'After-hours rate override', meta: 'Agent J. Okafor · 03:14 local', time: '41m ago', shade: false },
              { dot: 'bg-brand', title: 'Unbilled minibar batch flagged', meta: '42 folios · Meridian Old Town', time: '1h ago', shade: true },
            ].map((a, i) => (
              <div key={i} className={`flex items-center gap-3.5 rounded-2xl px-3 py-2.5 ${a.shade ? 'bg-[rgba(20,30,70,.035)]' : ''}`}>
                <span className={`h-2 w-2 flex-none rounded-full ${a.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{a.title}</div>
                  <div className="text-xs text-faint">{a.meta}</div>
                </div>
                <span className="flex-none text-xs text-faint">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4.5">
            <h3 className="mb-1 text-base font-semibold">Property Risk Heatmap</h3>
            <p className="text-[12.5px] text-faint">Composite risk · 6 properties</p>
          </div>
          <Heatmap />
          <div className="mt-4 flex items-center gap-3 text-[11px] text-faint">
            <span>Low</span>
            <div className="h-[7px] flex-1 rounded" style={{ background: 'linear-gradient(90deg,#5fbf99,#e0c65a,#e5563f)' }} />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
