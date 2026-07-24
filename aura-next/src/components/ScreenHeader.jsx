import Icon from './Icon.jsx';

export default function ScreenHeader({ title, sub }) {
  return (
    <div className="mb-5.5 mx-1 mt-1.5 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="mb-1.5 text-[27px] font-semibold tracking-[-.02em]">{title}</h1>
        <p className="text-sm text-body">{sub}</p>
      </div>
      <div className="flex flex-none items-center gap-3 max-[860px]:w-full max-[860px]:justify-between">
        <div
          className="flex gap-0.5 rounded-full border border-[rgba(20,30,70,.1)] p-1"
          style={{ background: 'linear-gradient(145deg,rgba(20,30,70,.06),rgba(20,30,70,.015) 60%)', boxShadow: 'inset 0 1px 2px rgba(20,30,70,.05)' }}
        >
          <span className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium text-body max-[860px]:px-2.5 max-[860px]:text-xs">Today</span>
          <span
            className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold text-brand max-[860px]:px-2.5 max-[860px]:text-xs"
            style={{ background: 'linear-gradient(150deg,rgba(255,255,255,.32),rgba(255,255,255,.04) 60%)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.7),0 4px 10px -6px rgba(79,140,255,.2)' }}
          >
            7 days
          </span>
          <span className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium text-body max-[860px]:px-2.5 max-[860px]:text-xs">30 days</span>
        </div>
        <button className="btn-primary flex items-center gap-2 px-5.5 py-2.5 text-[13.5px]">
          <Icon name="export" size={16} /> Export
        </button>
      </div>
    </div>
  );
}
