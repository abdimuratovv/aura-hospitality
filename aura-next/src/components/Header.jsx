import Icon from './Icon.jsx';
import { initialsFromName } from '../lib/format.js';

export default function Header({ user, onLogout, onMenuClick }) {
  return (
    <header className="glass-header flex flex-wrap items-center gap-4 p-3 px-4.5 max-[860px]:row-gap-2.5">
      <button
        onClick={onMenuClick}
        title="Menu"
        className="icon-btn hidden h-9.5 w-9.5 flex-none max-[860px]:flex"
      >
        <Icon name="menu" size={18} />
      </button>

      <div className="flex flex-none items-center gap-2.5 border-r border-[rgba(60,70,110,.1)] pr-4 max-[860px]:pr-2.5">
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] border border-white/60 text-brand"
          style={{ background: 'linear-gradient(160deg,rgba(79,140,255,.22),rgba(70,210,200,.18))' }}
        >
          <Icon name="hotel" size={18} />
        </div>
        <div>
          <div className="text-[11px] font-medium leading-tight text-faint">Meridian Hotels Group</div>
          <div className="flex items-center gap-1.5 text-[13.5px] font-semibold leading-tight">
            The Grand Meridian · NYC <Icon name="chevron" size={14} />
          </div>
        </div>
      </div>

      <div className="soft-input flex min-w-0 flex-1 max-w-[420px] items-center gap-2.5 px-3.5 py-2.5 max-[860px]:order-3 max-[860px]:max-w-none max-[860px]:basis-full">
        <Icon name="search" size={18} />
        <input
          placeholder="Search transactions, alerts, employees…"
          className="w-full min-w-0 border-none bg-transparent text-[13.5px] text-ink outline-none"
        />
        <span className="flex-none rounded-md border border-[rgba(60,70,110,.16)] px-1.5 py-0.5 text-[11px] text-faint">⌘K</span>
      </div>

      <div className="flex-1" />

      <button title="Theme" className="icon-btn h-10 w-10 flex-none">
        <Icon name="theme" size={18} />
      </button>
      <button title="Notifications" className="icon-btn relative h-10 w-10 flex-none">
        <Icon name="bell" size={18} />
        <span className="animate-pulse-dot absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#e5563f] shadow-[0_0_0_2px_rgba(255,255,255,.9)]" />
      </button>
      <button
        onClick={onLogout}
        title="Sign out"
        className="flex flex-none items-center gap-2.5 rounded-full border border-[rgba(20,30,70,.1)] py-1 pl-1 pr-3 cursor-pointer"
        style={{ background: 'linear-gradient(145deg,rgba(20,30,70,.05),rgba(20,30,70,.01) 60%)', boxShadow: 'inset 0 1px 2px rgba(20,30,70,.04)' }}
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
