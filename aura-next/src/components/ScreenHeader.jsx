import Icon from './Icon.jsx';
import { useLanguage } from '../lib/i18n/LanguageContext.jsx';

export default function ScreenHeader({ title, sub }) {
  const { t } = useLanguage();
  return (
    <div className="mb-5.5 mx-1 mt-1.5 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="mb-1.5 text-[27px] font-semibold tracking-[-.02em]">{title}</h1>
        <p className="text-sm text-body">{sub}</p>
      </div>
      <div className="flex flex-none items-center gap-3 max-[860px]:w-full max-[860px]:justify-between">
        <div
          className="flex gap-0.5 rounded-full border border-[rgba(var(--tint-ink),.1)] p-1"
          style={{ background: 'linear-gradient(145deg,rgba(var(--tint-ink),.06),rgba(var(--tint-ink),.015) 60%)', boxShadow: 'inset 0 1px 2px rgba(var(--tint-ink),.05)' }}
        >
          <span className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium text-body max-[860px]:px-2.5 max-[860px]:text-xs">{t('common.today')}</span>
          <span
            className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold text-brand max-[860px]:px-2.5 max-[860px]:text-xs"
            style={{ background: 'linear-gradient(150deg,rgba(255,255,255,.32),rgba(255,255,255,.04) 60%)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.7),0 4px 10px -6px rgba(79,140,255,.2)' }}
          >
            {t('common.days7')}
          </span>
          <span className="cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium text-body max-[860px]:px-2.5 max-[860px]:text-xs">{t('common.days30')}</span>
        </div>
        <button className="btn-primary flex items-center gap-2 px-5.5 py-2.5 text-[13.5px]">
          <Icon name="export" size={16} /> {t('common.export')}
        </button>
      </div>
    </div>
  );
}
