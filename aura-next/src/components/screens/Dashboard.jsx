'use client';

import { useEffect, useState } from 'react';
import Icon from '../Icon.jsx';
import { timeAgo, buildTrendPaths } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

function cellColor(v) {
  if (v < 0.33) return `rgba(95,191,153,${0.25 + v})`;
  if (v < 0.6) return `rgba(224,198,90,${0.3 + v * 0.5})`;
  return `rgba(229,86,63,${0.35 + v * 0.5})`;
}

function Heatmap({ heatmap }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(heatmap).map(([name, scores]) => (
        <div key={name} className="grid grid-cols-[128px_1fr] items-center gap-2.5">
          <span className="truncate text-[11.5px] font-medium text-faint-2">{name}</span>
          <div className="grid grid-cols-7 gap-1">
            {scores.map((v, ci) => (
              <div
                key={ci}
                title={`${name} · risk ${Math.round(v * 100)}`}
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

const ALERT_DOT = { CRITICAL: 'bg-critical', WARNING: 'bg-warning', INFO: 'bg-brand' };

export default function Dashboard({ goAlerts, activePropertyId, properties }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loadedFor, setLoadedFor] = useState(activePropertyId);

  if (loadedFor !== activePropertyId) {
    setLoadedFor(activePropertyId);
    setData(null);
  }

  useEffect(() => {
    let cancelled = false;
    const qs = activePropertyId ? `?propertyId=${activePropertyId}` : '';
    async function load() {
      try {
        const res = await fetch(`/api/dashboard${qs}`);
        if (!res.ok) throw new Error('Failed to load dashboard');
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
  }, [activePropertyId]);

  const INSIGHT_META = {
    CRITICAL: { label: t('dashboard.insightCritical'), dot: 'bg-critical', text: 'text-critical', border: 'border-[rgba(229,86,63,.16)]', bg: 'bg-[rgba(229,86,63,.08)]' },
    OPPORTUNITY: { label: t('dashboard.insightOpportunity'), dot: 'bg-warning', text: 'text-warning', border: 'border-[rgba(214,158,46,.16)]', bg: 'bg-[rgba(214,158,46,.08)]' },
    TREND: { label: t('dashboard.insightTrend'), dot: 'bg-brand', text: 'text-brand', border: 'border-[rgba(79,140,255,.16)]', bg: 'bg-[rgba(79,140,255,.08)]' },
  };

  if (error) return <div className="text-sm text-critical">{t('common.loadError')}</div>;
  if (!data) return <div className="text-sm text-faint">{t('common.loading')}</div>;

  const s = data.snapshot;
  const weekly = data.weeklyFinancials ?? [];
  const revenueTrend = buildTrendPaths(weekly.map((w) => w.revenue));
  const recoveredTrend = buildTrendPaths(weekly.map((w) => w.leakageRecovered));
  const lastRevenuePoint = revenueTrend.points.at(-1);
  const axisLabels = weekly.filter((_, i) => i % 2 === 0).map((w) => w.weekLabel);
  const activeProperty = properties?.find((p) => p.id === activePropertyId);
  const trendScope = activeProperty ? activeProperty.shortName : t('dashboard.allPropertiesScope');
  const statCards = [
    { label: t('dashboard.portfolioRevenue'), icon: 'revenue', iconC: 'text-success', iconBg: 'bg-success-bg', value: `$${(s.portfolioRevenue / 1e6).toFixed(2)}M`, badge: `▲ ${s.portfolioRevenueChangePct}%`, badgeC: 'text-success', badgeBg: 'bg-success-bg', note: t('dashboard.vsLastWeek') },
    { label: t('dashboard.activeFraudAlerts'), icon: 'shield', iconC: 'text-critical', iconBg: 'bg-critical-bg', value: String(s.activeFraudAlerts), badge: `${s.activeFraudAlertsCritical} ${t('status.critical').toLowerCase()}`, badgeC: 'text-critical', badgeBg: 'bg-critical-bg', note: t('dashboard.needsReview') },
    { label: t('dashboard.revenueLeakage'), icon: 'drop', iconC: 'text-warning', iconBg: 'bg-warning-bg', value: `$${Math.round(s.revenueLeakage / 1000)}K`, badge: `$${Math.round(s.revenueLeakageRecovered / 1000)}K ${t('dashboard.legendRecovered').toLowerCase()}`, badgeC: 'text-warning', badgeBg: 'bg-warning-bg', note: '' },
    { label: t('dashboard.nightAudit'), icon: 'moon', iconC: 'text-brand', iconBg: 'bg-[rgba(79,140,255,.16)]', value: `${s.nightAuditPct}%`, badge: t('dashboard.reconciled'), badgeC: 'text-success', badgeBg: 'bg-success-bg', note: t('dashboard.exceptions', { n: s.nightAuditExceptions }) },
  ];

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
              <h3 className="mb-1 text-base font-semibold">{t('dashboard.revenueVsLeakage')}</h3>
              <p className="text-[12.5px] text-faint">{t('dashboard.last12Weeks', { scope: trendScope })}</p>
            </div>
            <div className="flex gap-4 text-xs text-body">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />{t('dashboard.legendRevenue')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] bg-teal" />{t('dashboard.legendRecovered')}</span>
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
            <path d={revenueTrend.areaPath} fill="url(#aRev)" />
            <path d={revenueTrend.linePath} fill="none" stroke="#4f8cff" strokeWidth="2.5" strokeLinecap="round" />
            <path d={recoveredTrend.areaPath} fill="url(#aRec)" />
            <path d={recoveredTrend.linePath} fill="none" stroke="#46d2c8" strokeWidth="2.5" strokeLinecap="round" />
            {lastRevenuePoint && (
              <circle cx={lastRevenuePoint.x} cy={lastRevenuePoint.y} r="4.5" fill="#4f8cff" stroke="#fff" strokeWidth="2" />
            )}
          </svg>
          <div className="mt-2.5 flex justify-between text-[11px] text-hairline">
            {axisLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4.5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] text-white" style={{ background: 'linear-gradient(160deg,#7dabff,#7a6bff)' }}>
              <Icon name="spark" size={16} />
            </span>
            <h3 className="text-base font-semibold">{t('dashboard.aiInsights')}</h3>
          </div>
          <div className="flex flex-col gap-3.5">
            {data.insights.map((insight) => {
              const meta = INSIGHT_META[insight.type];
              return (
                <div key={insight.id} className={`rounded-2xl border p-3.5 ${meta.border} ${meta.bg}`}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-[.04em] ${meta.text}`}>{meta.label}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-soft">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass-card p-6">
          <div className="mb-4.5 flex items-center justify-between">
            <h3 className="text-base font-semibold">{t('dashboard.recentAlerts')}</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); goAlerts(); }} className="text-[12.5px] font-semibold">{t('common.viewAll')}</a>
          </div>
          <div className="flex flex-col gap-1">
            {data.recentAlerts.map((a, i) => (
              <div key={a.id} className={`flex items-center gap-3.5 rounded-2xl px-3 py-2.5 ${i % 2 === 1 ? 'bg-[rgba(20,30,70,.035)]' : ''}`}>
                <span className={`h-2 w-2 flex-none rounded-full ${ALERT_DOT[a.severity]}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold">{a.title}</div>
                  <div className="text-xs text-faint">{a.meta}</div>
                </div>
                <span className="flex-none text-xs text-faint">{timeAgo(a.createdAt, t)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4.5">
            <h3 className="mb-1 text-base font-semibold">{t('dashboard.propertyRiskHeatmap')}</h3>
            <p className="text-[12.5px] text-faint">{t('dashboard.compositeRisk', { n: Object.keys(data.heatmap).length })}</p>
          </div>
          <Heatmap heatmap={data.heatmap} />
          <div className="mt-4 flex items-center gap-3 text-[11px] text-faint">
            <span>{t('dashboard.low')}</span>
            <div className="h-[7px] flex-1 rounded" style={{ background: 'linear-gradient(90deg,#5fbf99,#e0c65a,#e5563f)' }} />
            <span>{t('dashboard.high')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
