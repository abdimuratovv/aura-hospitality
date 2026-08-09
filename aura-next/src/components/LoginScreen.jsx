'use client';

import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useLanguage } from '../lib/i18n/LanguageContext.jsx';

export default function LoginScreen({ onLoginSuccess }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('e.reyes@meridianhotels.com');
  const [password, setPassword] = useState('aura-secure-2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t('login.errorGeneric'));
        return;
      }
      onLoginSuccess(json);
    } catch {
      setError(t('login.errorNetwork'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-y-auto p-6 max-[760px]:p-4 max-[480px]:p-2.5">
      <div className="absolute right-6 top-6 z-10 max-[480px]:right-3 max-[480px]:top-3">
        <LanguageSwitcher />
      </div>
      <div className="glass-login grid w-full max-w-[940px] animate-fade-up-slow grid-cols-[1.05fr_.95fr] overflow-hidden max-[760px]:grid-cols-1">
        <div
          className="relative flex flex-col justify-between overflow-hidden border-r border-white/50 p-11 max-[760px]:p-[30px_28px] max-[480px]:p-[26px_22px] dark:border-white/10"
          style={{ background: 'linear-gradient(160deg,rgba(79,140,255,.14),rgba(70,210,200,.1))' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[13px]"
              style={{
                background: 'linear-gradient(160deg,#7dabff,#4f8cff)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,.7),0 10px 24px -10px rgba(79,140,255,.7)',
              }}
            >
              <div
                className="h-[15px] w-[15px] rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%,#fff,rgba(255,255,255,.2))',
                  boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.15)',
                }}
              />
            </div>
            <span className="text-[21px] font-semibold tracking-[.14em]">AURA</span>
          </div>
          <div>
            <div className="mb-3.5 text-[13px] font-semibold tracking-[.16em] text-brand uppercase">{t('login.tagline')}</div>
            <h1 className="mb-4 text-[34px] font-semibold leading-[1.15] tracking-[-.02em] max-[760px]:text-[25px]">
              {t('login.headline')}
            </h1>
            <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted">
              {t('login.subtext')}
            </p>
          </div>
          <div className="flex gap-6 text-[13px] text-faint-2">
            <div><div className="text-[22px] font-semibold text-ink">$1.9B</div>{t('login.statRevenueLabel')}</div>
            <div><div className="text-[22px] font-semibold text-ink">$47M</div>{t('login.statLeakageLabel')}</div>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col justify-center p-11 max-[760px]:p-[30px_28px] max-[480px]:p-[26px_22px]">
          <h2 className="mb-1.5 text-2xl font-semibold tracking-[-.01em]">{t('login.signInHeading')}</h2>
          <p className="mb-7 text-sm text-body">{t('login.signInSubtitle')}</p>

          <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('login.workEmail')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="soft-input mb-4.5 px-4 py-3.5 text-[14.5px]"
          />

          <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('login.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="soft-input mb-3 px-4 py-3.5 text-[14.5px]"
          />

          {error && <p className="mb-3 text-[13px] font-medium text-critical">{error}</p>}

          <div className="mb-6 flex items-center justify-between text-[13px]">
            <label className="flex cursor-pointer items-center gap-1.5 text-muted">
              <span
                className="inline-block h-4 w-4 rounded-[5px]"
                style={{ background: 'linear-gradient(160deg,#7dabff,#4f8cff)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.6)' }}
              />
              {t('login.rememberMe')}
            </label>
            <a href="#">{t('login.forgotPassword')}</a>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full px-7 py-4 text-[15.5px] disabled:opacity-60">
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>

          <div className="my-5.5 flex items-center gap-3 text-[12.5px] text-faint">
            <div className="h-px flex-1 bg-[rgba(var(--tint-slate),.14)]" />
            {t('login.or')}
            <div className="h-px flex-1 bg-[rgba(var(--tint-slate),.14)]" />
          </div>

          <button type="button" onClick={submit} disabled={loading} className="btn-ghost w-full py-3.5 text-sm font-medium text-ink-soft disabled:opacity-60">
            {t('login.ssoButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
