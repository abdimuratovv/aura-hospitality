const navItems = ['Profile', 'Security & Access', 'Notifications', 'Detection Rules', 'Integrations', 'Data & Privacy'];

function ToggleOn() {
  return (
    <span
      className="relative h-[27px] w-[46px] rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,.2)]"
      style={{ background: 'linear-gradient(160deg,#7dabff,#4f8cff)' }}
    >
      <span className="absolute right-1 top-1 h-[21px] w-[21px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.2)]" />
    </span>
  );
}
function ToggleOff() {
  return (
    <span className="relative h-[27px] w-[46px] rounded-2xl bg-[rgba(60,70,110,.18)]">
      <span className="absolute left-1 top-1 h-[21px] w-[21px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.15)]" />
    </span>
  );
}

export default function Settings() {
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
          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-xl font-semibold text-white" style={{ background: 'linear-gradient(160deg,#6b9,#489)' }}>ER</span>
          <div>
            <div className="text-[15px] font-semibold">Elena Reyes</div>
            <div className="mb-2 text-[13px] text-faint">Chief Financial Officer · Meridian Hotels Group</div>
            <button className="btn-outline px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-soft">Change photo</button>
          </div>
        </div>

        <div className="mb-6.5 grid grid-cols-1 gap-4.5 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Full name</label>
            <input defaultValue="Elena Reyes" className="soft-input-plain px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Work email</label>
            <input defaultValue="e.reyes@meridianhotels.com" className="soft-input-plain px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Role</label>
            <input defaultValue="Chief Financial Officer" className="soft-input-plain px-3.5 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-semibold text-muted">Default property</label>
            <input defaultValue="The Grand Meridian · NYC" className="soft-input-plain px-3.5 py-3 text-sm" />
          </div>
        </div>

        <div className="border-t border-[rgba(60,70,110,.08)] pt-5">
          <div className="flex items-center justify-between py-3">
            <div><div className="text-sm font-semibold">Two-factor authentication</div><div className="text-[12.5px] text-faint">Required for all finance roles</div></div>
            <ToggleOn />
          </div>
          <div className="flex items-center justify-between py-3">
            <div><div className="text-sm font-semibold">Critical fraud alerts by email</div><div className="text-[12.5px] text-faint">Real-time when confidence &gt; 90%</div></div>
            <ToggleOn />
          </div>
          <div className="flex items-center justify-between py-3">
            <div><div className="text-sm font-semibold">Weekly executive digest</div><div className="text-[12.5px] text-faint">Monday 07:00 · portfolio summary</div></div>
            <ToggleOff />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="btn-primary px-6.5 py-3.5 text-sm">Save changes</button>
          <button className="rounded-full border border-white/30 px-6.5 py-3.5 text-sm font-medium text-muted" style={{ background: 'linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.02) 60%)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
