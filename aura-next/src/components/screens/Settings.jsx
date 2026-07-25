'use client';

import { useEffect, useState } from 'react';
import { initialsFromName } from '../../lib/format.js';

const navItems = ['Profile', 'Security & Access', 'Notifications', 'Detection Rules', 'Integrations', 'Data & Privacy'];

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

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved

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
      .catch((err) => setError(err.message));
  }, []);

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

  if (error) return <div className="text-sm text-critical">{error}</div>;
  if (!profile) return <div className="text-sm text-faint">Loading…</div>;

  return (
    <div className="grid animate-fade-up grid-cols-1 gap-4 lg:grid-cols-[236px_1fr]">
      <div className="glass-card h-fit p-3">
        <div className="flex flex-col gap-1">
          {navItems.map((label, i) => (
            <span
              key={label}
              className={
                i === 0
                  ? 'cursor-pointer rounded-xl border border-[rgba(79,140,255,.22)] px-3.5 py-2.5 text-[13.5px] font-semibold text-brand shadow-[inset_0_1px_1px_rgba(255,255,255,.7)]'
                  : 'cursor-pointer rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-muted'
              }
              style={i === 0 ? { background: 'linear-gradient(150deg,rgba(79,140,255,.14),rgba(79,140,255,.05) 60%)' } : undefined}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card p-7">
        <h3 className="mb-5.5 text-[17px] font-semibold">Profile</h3>
        <div className="mb-6.5 flex items-center gap-4">
          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-xl font-semibold text-white" style={{ background: 'linear-gradient(160deg,#6b9,#489)' }}>
            {initialsFromName(profile.name)}
          </span>
          <div>
            <div className="text-[15px] font-semibold">{profile.name}</div>
            <div className="mb-2 text-[13px] text-faint">{profile.role} · Meridian Hotels Group</div>
            <button className="btn-outline px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-soft">Change photo</button>
          </div>
        </div>

        <div className="mb-6.5 grid grid-cols-1 gap-4.5 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Work email</label>
            <input value={profile.email} readOnly className={disabledField} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Role</label>
            <input value={profile.role} readOnly className={disabledField} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Default property</label>
            <input value={profile.defaultProperty?.name ?? '—'} readOnly className={disabledField} />
          </div>
        </div>

        <div className="border-t border-[rgba(60,70,110,.08)] pt-5">
          <div className="flex items-center justify-between py-3">
            <div><div className="text-sm font-semibold">Two-factor authentication</div><div className="text-[12.5px] text-faint">Required for all finance roles</div></div>
            <Toggle on={profile.twoFactorEnabled} onClick={() => toggle('twoFactorEnabled')} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div><div className="text-sm font-semibold">Critical fraud alerts by email</div><div className="text-[12.5px] text-faint">Real-time when confidence &gt; 90%</div></div>
            <Toggle on={profile.criticalAlertsEmail} onClick={() => toggle('criticalAlertsEmail')} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div><div className="text-sm font-semibold">Weekly executive digest</div><div className="text-[12.5px] text-faint">Monday 07:00 · portfolio summary</div></div>
            <Toggle on={profile.weeklyDigest} onClick={() => toggle('weeklyDigest')} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={save} disabled={saveState === 'saving'} className="btn-primary px-6.5 py-3.5 text-sm disabled:opacity-60">
            {saveState === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={() => { setName(profile.name); }}
            className="rounded-full border border-white/30 px-6.5 py-3.5 text-sm font-medium text-muted"
            style={{ background: 'linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.02) 60%)' }}
          >
            Cancel
          </button>
          {saveState === 'saved' && <span className="text-[13px] font-medium text-success">Saved</span>}
        </div>
      </div>
    </div>
  );
}
