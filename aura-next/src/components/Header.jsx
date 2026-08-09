'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { initialsFromName, timeAgo, ALERT_SEVERITY_META } from '../lib/format.js';
import { useLanguage } from '../lib/i18n/LanguageContext.jsx';
import { useTheme } from '../lib/theme/ThemeContext.jsx';

function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onOutside]);
  return ref;
}

function PropertySwitcher({ properties, activePropertyId, onPropertyChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const active = properties.find((p) => p.id === activePropertyId);
  const label = active ? active.name : t('common.allProperties');

  return (
    <div ref={ref} className="relative flex flex-none items-center gap-2.5 border-r border-[rgba(var(--tint-slate),.1)] pr-4 max-[860px]:pr-2.5">
      <div
        className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-white/60 text-brand dark:border-white/10"
        style={{ background: 'linear-gradient(160deg,rgba(79,140,255,.22),rgba(70,210,200,.18))' }}
      >
        <Icon name="hotel" size={18} />
      </div>
      <button onClick={() => setOpen((o) => !o)} className="cursor-pointer text-left">
        <div className="text-[11px] font-medium leading-tight text-faint">Meridian Hotels Group</div>
        <div className="flex items-center gap-1.5 text-[13.5px] font-semibold leading-tight">
          {label} <Icon name="chevron" size={14} />
        </div>
      </button>

      {open && (
        <div className="glass-card absolute left-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden p-1.5">
          <span
            onClick={() => { onPropertyChange(null); setOpen(false); }}
            className={`block cursor-pointer rounded-lg px-3 py-2 text-[13px] ${!activePropertyId ? 'font-semibold text-brand' : 'text-body'}`}
          >
            {t('common.allProperties')}
          </span>
          {properties.map((p) => (
            <span
              key={p.id}
              onClick={() => { onPropertyChange(p.id); setOpen(false); }}
              className={`block cursor-pointer rounded-lg px-3 py-2 text-[13px] ${p.id === activePropertyId ? 'font-semibold text-brand' : 'text-body'}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchBox({ onNavigate }) {
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const SEARCH_GROUPS = [
    { key: 'transactions', label: t('header.searchGroupTransactions'), screen: 'transactions' },
    { key: 'alerts', label: t('header.searchGroupAlerts'), screen: 'alerts' },
    { key: 'employees', label: t('header.searchGroupEmployees'), screen: 'employees' },
    { key: 'fraudCases', label: t('header.searchGroupFraudCases'), screen: 'fraud' },
  ];

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch {
        // ignore transient search errors
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  function go(screen) {
    onNavigate(screen);
    setOpen(false);
    setQ('');
  }

  const trimmedQ = q.trim();
  const displayResults = trimmedQ.length < 2 ? null : results;
  const hasResults = displayResults && SEARCH_GROUPS.some((g) => displayResults[g.key]?.length);

  return (
    <div ref={ref} className="soft-input relative flex min-w-0 flex-1 max-w-[420px] items-center gap-2.5 px-3.5 py-2.5 max-[860px]:order-3 max-[860px]:max-w-none max-[860px]:basis-full">
      <Icon name="search" size={18} />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={t('header.searchPlaceholder')}
        className="w-full min-w-0 border-none bg-transparent text-[13.5px] text-ink outline-none"
      />
      <span className="flex-none rounded-md border border-[rgba(var(--tint-slate),.16)] px-1.5 py-0.5 text-[11px] text-faint">⌘K</span>

      {open && trimmedQ.length >= 2 && (
        <div className="glass-card absolute left-0 top-[calc(100%+8px)] z-20 max-h-[360px] w-full min-w-[280px] overflow-y-auto p-1.5">
          {!displayResults && <div className="px-3 py-3 text-[12.5px] text-faint">{t('header.searching')}</div>}
          {displayResults && !hasResults && <div className="px-3 py-3 text-[12.5px] text-faint">{t('header.noMatches')}</div>}
          {displayResults && SEARCH_GROUPS.map((g) => {
            const rows = displayResults[g.key];
            if (!rows?.length) return null;
            return (
              <div key={g.key} className="mb-1 last:mb-0">
                <div className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-faint">{g.label}</div>
                {rows.map((r) => (
                  <span
                    key={r.id}
                    onClick={() => go(g.screen)}
                    className="block cursor-pointer truncate rounded-lg px-3 py-2 text-[13px] text-body hover:text-ink"
                  >
                    {g.key === 'transactions' && `#${r.folioId} · ${r.type} · ${r.agent}`}
                    {g.key === 'alerts' && r.title}
                    {g.key === 'employees' && `${r.name} · ${r.role}`}
                    {g.key === 'fraudCases' && `${r.pattern} · ${r.agent}`}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NotificationsBell({ onNavigate }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const ref = useClickOutside(() => setOpen(false));

  useEffect(() => {
    fetch('/api/alerts?limit=20')
      .then((res) => res.json())
      .then((json) => setAlerts(json.rows ?? []))
      .catch(() => setAlerts([]));
  }, []);

  const openAlerts = alerts.filter((a) => a.status === 'OPEN');

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} title={t('common.notifications')} className="icon-btn relative h-10 w-10 flex-none">
        <Icon name="bell" size={18} />
        {openAlerts.length > 0 && (
          <span className="animate-pulse-dot absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#e5563f]" style={{ boxShadow: '0 0 0 2px var(--dot-ring)' }} />
        )}
      </button>

      {open && (
        <div className="glass-card absolute right-0 top-[calc(100%+8px)] z-20 max-h-[400px] w-80 overflow-y-auto p-1.5">
          <div className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-faint">
            {openAlerts.length > 0 ? t('header.nOpen', { n: openAlerts.length }) : t('header.allCaughtUp')}
          </div>
          {alerts.slice(0, 5).map((a) => {
            const meta = ALERT_SEVERITY_META[a.severity];
            return (
              <div key={a.id} className="flex items-start gap-2.5 rounded-lg px-3 py-2">
                <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: meta.dot }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-ink">{a.title}</div>
                  <div className="text-[11px] text-faint">{timeAgo(a.createdAt, t)}</div>
                </div>
              </div>
            );
          })}
          {alerts.length === 0 && <div className="px-3 py-3 text-[12.5px] text-faint">{t('header.noAlertsYet')}</div>}
          <span
            onClick={() => { onNavigate('alerts'); setOpen(false); }}
            className="mt-1 block cursor-pointer rounded-lg px-3 py-2 text-center text-[12.5px] font-semibold text-brand"
          >
            {t('common.viewAll')}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Header({ user, onLogout, onMenuClick, properties = [], activePropertyId, onPropertyChange, onNavigate }) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="glass-header flex flex-wrap items-center gap-4 p-3 px-4.5 max-[860px]:row-gap-2.5">
      <button
        onClick={onMenuClick}
        title={t('common.menu')}
        className="icon-btn hidden h-9.5 w-9.5 flex-none max-[860px]:flex"
      >
        <Icon name="menu" size={18} />
      </button>

      <PropertySwitcher properties={properties} activePropertyId={activePropertyId} onPropertyChange={onPropertyChange} />

      <SearchBox onNavigate={onNavigate} />

      <div className="flex-1" />

      <LanguageSwitcher />
      <button onClick={toggleTheme} title={t('common.theme')} className="icon-btn h-10 w-10 flex-none">
        <Icon name={theme === 'dark' ? 'theme' : 'moon'} size={18} />
      </button>
      <NotificationsBell onNavigate={onNavigate} />
      <button
        onClick={onLogout}
        title={t('common.signOut')}
        className="flex flex-none items-center gap-2.5 rounded-full border border-[rgba(var(--tint-ink),.1)] py-1 pl-1 pr-3 cursor-pointer"
        style={{ background: 'linear-gradient(145deg,rgba(var(--tint-ink),.05),rgba(var(--tint-ink),.01) 60%)', boxShadow: 'inset 0 1px 2px rgba(var(--tint-ink),.04)' }}
      >
        <span
          className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[12px] font-semibold text-white"
          style={{ background: 'linear-gradient(160deg,#6b9,#489)' }}
        >
          {initialsFromName(user?.name)}
        </span>
        <span className="hidden text-left min-[861px]:block">
          <span className="block text-[12.5px] font-semibold leading-tight">{user?.name}</span>
          <span className="block text-[11px] leading-tight text-faint">{user?.role}</span>
        </span>
      </button>
    </header>
  );
}
