import Icon from './Icon.jsx';
import { SCREEN_IDS } from '../lib/data.js';
import { useLanguage } from '../lib/i18n/LanguageContext.jsx';

export default function Sidebar({ screen, setScreen, collapsed, toggleCollapsed, mobileOpen, closeMobile }) {
  const { t } = useLanguage();
  const showLabels = !collapsed;

  const handleNav = (id) => {
    setScreen(id);
    closeMobile?.();
  };

  const drawerTranslate = mobileOpen ? 'max-[860px]:translate-x-0' : 'max-[860px]:-translate-x-[120%]';

  return (
    <>
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-50 hidden bg-[rgba(20,30,60,.32)] backdrop-blur-[2px] max-[860px]:block"
        />
      )}
      <aside
        style={{ width: collapsed ? '78px' : '256px' }}
        className={`glass-panel flex flex-col p-3.5 transition-[width,transform] duration-300 ease-out max-[860px]:fixed max-[860px]:top-2.5 max-[860px]:bottom-2.5 max-[860px]:left-2.5 max-[860px]:z-[60] max-[860px]:!h-auto max-[860px]:!w-[250px] max-[860px]:shadow-[0_20px_60px_-10px_rgba(var(--tint-ink),.4)] ${drawerTranslate}`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-5.5 pt-1.5">
          <div
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(160deg,#7dabff,#4f8cff)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,.7),0 10px 22px -10px rgba(79,140,255,.7)' }}
          >
            <div
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 30%,#fff,rgba(255,255,255,.2))', boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.15)' }}
            />
          </div>
          {showLabels && <span className="text-lg font-semibold tracking-[.14em]">AURA</span>}
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
          {SCREEN_IDS.map((id) => {
            const active = screen === id;
            const label = t(`nav.${id}`);
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                title={label}
                className={`nav-item text-[14px] ${collapsed ? 'justify-center py-3' : 'justify-start px-3.5 py-2.5'} ${active ? 'nav-item-active' : ''}`}
              >
                <Icon name={id} />
                {showLabels && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        <button
          onClick={toggleCollapsed}
          title={t('nav.collapse')}
          className={`mt-2 flex items-center gap-3 rounded-2xl border border-transparent bg-transparent px-3.5 py-2.5 text-[13.5px] font-medium text-body cursor-pointer ${collapsed ? 'justify-center' : 'justify-start'}`}
        >
          <Icon name={collapsed ? 'expand' : 'collapse'} />
          {showLabels && <span>{t('nav.collapse')}</span>}
        </button>
      </aside>
    </>
  );
}
