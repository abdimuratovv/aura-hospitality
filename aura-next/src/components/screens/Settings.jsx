'use client';

import { useEffect, useState } from 'react';
import { initialsFromName } from '../../lib/format.js';
import { useLanguage } from '../../lib/i18n/LanguageContext.jsx';

function Toggle({ on, onClick }) {
  return (
    <span
      onClick={onClick}
      className="relative h-[27px] w-[46px] cursor-pointer rounded-2xl transition-colors"
      style={on ? { background: 'linear-gradient(160deg,#7dabff,#4f8cff)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.2)' } : { background: 'rgba(60,70,110,.18)' }}
    >
      <span
        className="absolute top-1 h-[21px] w-[21px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.2)] transition-all"
        style={{ [on ? 'right' : 'left']: '4px' }}
      />
    </span>
  );
}

const field = 'soft-input-plain px-3.5 py-3 text-sm';
const disabledField = `${field} cursor-not-allowed opacity-70`;

const TAB_IDS = ['profile', 'security', 'notifications', 'detectionRules', 'integrations', 'dataPrivacy'];
const UNBUILT_TAB_IDS = ['detectionRules', 'integrations', 'dataPrivacy'];
const TAB_LABEL_KEYS = {
  profile: 'settings.navProfile',
  security: 'settings.navSecurity',
  notifications: 'settings.navNotifications',
  detectionRules: 'settings.navDetectionRules',
  integrations: 'settings.navIntegrations',
  dataPrivacy: 'settings.navDataPrivacy',
};

export default function Settings() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordState, setPasswordState] = useState('idle'); // idle | saving | saved

  useEffect(() => {
    fetch('/api/user/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((json) => {
        setProfile(json);
        setName(json.name);
      })
      .catch(() => setError(t('common.loadError')));
  }, [t]);

  async function save() {
    setSaveState('saving');
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        twoFactorEnabled: profile.twoFactorEnabled,
        criticalAlertsEmail: profile.criticalAlertsEmail,
        weeklyDigest: profile.weeklyDigest,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setProfile(json);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1800);
    } else {
      setSaveState('idle');
    }
  }

  function toggle(key) {
    setProfile((p) => ({ ...p, [key]: !p[key] }));
  }

  async function changePassword() {
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError(t('settings.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }
    setPasswordState('saving');
    const res = await fetch('/api/user/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setPasswordState('saved');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordState('idle'), 1800);
    } else {
      setPasswordError(json.error || t('settings.passwordChangeFailed'));
      setPasswordState('idle');
    }
  }

  if (error) return <div className="text-sm text-critical">{error}</div>;
  if (!profile) return <div className="text-sm text-faint">{t('common.loading')}</div>;

  const showSaveBar = !UNBUILT_TAB_IDS.includes(tab);

  return (
    <div className="grid animate-fade-up grid-cols-1 gap-4 lg:grid-cols-[236px_1fr]">
      <div className="glass-card h-fit p-3">
        <div className="flex flex-col gap-1">
          {TAB_IDS.map((id) => (
            <span
              key={id}
              onClick={() => setTab(id)}
              className={
                tab === id
                  ? 'cursor-pointer rounded-xl border border-[rgba(79,140,255,.22)] px-3.5 py-2.5 text-[13.5px] font-semibold text-brand shadow-[inset_0_1px_1px_rgba(255,255,255,.7)]'
                  : 'cursor-pointer rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-muted'
              }
              style={tab === id ? { background: 'linear-gradient(150deg,rgba(79,140,255,.14),rgba(79,140,255,.05) 60%)' } : undefined}
            >
              {t(TAB_LABEL_KEYS[id])}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card p-7">
        {tab === 'profile' && (
          <>
            <h3 className="mb-5.5 text-[17px] font-semibold">{t('settings.profileHeading')}</h3>
            <div className="mb-6.5 flex items-center gap-4">
              <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-xl font-semibold text-white" style={{ background: 'linear-gradient(160deg,#6b9,#489)' }}>
                {initialsFromName(profile.name)}
              </span>
              <div>
                <div className="text-[15px] font-semibold">{profile.name}</div>
                <div className="mb-2 text-[13px] text-faint">{profile.role} · Meridian Hotels Group</div>
                <button className="btn-outline px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-soft">{t('settings.changePhoto')}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.fullName')}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.workEmail')}</label>
                <input value={profile.email} readOnly className={disabledField} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.role')}</label>
                <input value={profile.role} readOnly className={disabledField} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.defaultProperty')}</label>
                <input value={profile.defaultProperty?.name ?? '—'} readOnly className={disabledField} />
              </div>
            </div>
          </>
        )}

        {tab === 'security' && (
          <>
            <h3 className="mb-5.5 text-[17px] font-semibold">{t('settings.securityHeading')}</h3>
            <div className="flex items-center justify-between py-3">
              <div><div className="text-sm font-semibold">{t('settings.twoFactor')}</div><div className="text-[12.5px] text-faint">{t('settings.twoFactorDesc')}</div></div>
              <Toggle on={profile.twoFactorEnabled} onClick={() => toggle('twoFactorEnabled')} />
            </div>

            <div className="mt-4 border-t border-[rgba(60,70,110,.08)] pt-5">
              <div className="mb-4 text-sm font-semibold">{t('settings.changePassword')}</div>
              <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.currentPassword')}</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.newPassword')}</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={field} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">{t('settings.confirmNewPassword')}</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={field} />
                </div>
              </div>
              {passwordError && <p className="mt-3 text-[13px] font-medium text-critical">{passwordError}</p>}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={changePassword}
                  disabled={passwordState === 'saving' || !currentPassword || !newPassword || !confirmPassword}
                  className="btn-primary px-6.5 py-3 text-sm disabled:opacity-60"
                >
                  {passwordState === 'saving' ? t('settings.updating') : t('settings.updatePassword')}
                </button>
                {passwordState === 'saved' && <span className="text-[13px] font-medium text-success">{t('settings.passwordUpdated')}</span>}
              </div>
            </div>
          </>
        )}

        {tab === 'notifications' && (
          <>
            <h3 className="mb-5.5 text-[17px] font-semibold">{t('settings.notificationsHeading')}</h3>
            <div className="flex items-center justify-between py-3">
              <div><div className="text-sm font-semibold">{t('settings.criticalFraudEmail')}</div><div className="text-[12.5px] text-faint">{t('settings.criticalFraudDesc')}</div></div>
              <Toggle on={profile.criticalAlertsEmail} onClick={() => toggle('criticalAlertsEmail')} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div><div className="text-sm font-semibold">{t('settings.weeklyDigest')}</div><div className="text-[12.5px] text-faint">{t('settings.weeklyDigestDesc')}</div></div>
              <Toggle on={profile.weeklyDigest} onClick={() => toggle('weeklyDigest')} />
            </div>
          </>
        )}

        {UNBUILT_TAB_IDS.includes(tab) && (
          <>
            <h3 className="mb-2 text-[17px] font-semibold">{t(TAB_LABEL_KEYS[tab])}</h3>
            <p className="text-[13.5px] text-faint">{t('settings.notBuiltYet')}</p>
          </>
        )}

        {showSaveBar && (
          <div className="mt-6 flex items-center gap-3 border-t border-[rgba(60,70,110,.08)] pt-5">
            <button onClick={save} disabled={saveState === 'saving'} className="btn-primary px-6.5 py-3.5 text-sm disabled:opacity-60">
              {saveState === 'saving' ? t('common.saving') : t('common.save')}
            </button>
            <button
              onClick={() => { setName(profile.name); }}
              className="rounded-full border border-white/30 px-6.5 py-3.5 text-sm font-medium text-muted"
              style={{ background: 'linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.02) 60%)' }}
            >
              {t('common.cancel')}
            </button>
            {saveState === 'saved' && <span className="text-[13px] font-medium text-success">{t('common.saved')}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
