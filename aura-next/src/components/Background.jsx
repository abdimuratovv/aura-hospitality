import { useTheme } from '../lib/theme/ThemeContext.jsx';

export default function Background() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="animate-float-blob absolute -top-[14%] -left-[12%] h-[62%] w-[62%] rounded-full blur-[34px]"
        style={{ background: `radial-gradient(circle at 35% 35%,rgba(125,171,255,${isDark ? '.3' : '.22'}),rgba(125,171,255,0) 65%)` }}
      />
      <div
        className="animate-float-blob2 absolute top-[8%] -right-[16%] h-[58%] w-[58%] rounded-full blur-[46px]"
        style={{ background: `radial-gradient(circle at 50% 50%,rgba(129,140,255,${isDark ? '.22' : '.16'}),rgba(129,140,255,0) 70%)` }}
      />
      <div
        className="animate-float-blob-rev absolute -bottom-[18%] left-[12%] h-[66%] w-[66%] rounded-full blur-[52px]"
        style={{ background: `radial-gradient(circle at 50% 50%,rgba(70,210,200,${isDark ? '.26' : '.2'}),rgba(70,210,200,0) 70%)` }}
      />
      <div
        className="animate-float-blob2-rev absolute -bottom-[6%] right-0 h-[44%] w-[44%] rounded-full blur-[48px]"
        style={{ background: `radial-gradient(circle at 50% 50%,rgba(150,180,255,${isDark ? '.2' : '.14'}),rgba(150,180,255,0) 70%)` }}
      />
      <div
        className="animate-float-blob-slow absolute top-[38%] left-[38%] h-[30%] w-[30%] rounded-full blur-[40px]"
        style={{ background: `radial-gradient(circle at 50% 50%,rgba(255,255,255,${isDark ? '.12' : '.5'}),rgba(255,255,255,0) 70%)` }}
      />

      <div
        className="animate-drift-grid absolute -inset-[10%] opacity-60"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(rgba(150,170,230,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(150,170,230,.07) 1px,transparent 1px)'
            : 'linear-gradient(rgba(80,100,150,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(80,100,150,.05) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%,#000 40%,transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%,#000 40%,transparent 85%)',
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[.025] mix-blend-overlay">
        <filter id="auraGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auraGrain)" />
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 120% 90% at 50% 30%,rgba(0,0,0,0) 50%,rgba(0,0,0,.35) 100%)'
            : 'radial-gradient(ellipse 120% 90% at 50% 30%,rgba(0,0,0,0) 55%,rgba(20,30,60,.05) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'linear-gradient(115deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,0) 22%,rgba(255,255,255,0) 78%,rgba(255,255,255,.04) 100%)'
            : 'linear-gradient(115deg,rgba(255,255,255,.35) 0%,rgba(255,255,255,0) 22%,rgba(255,255,255,0) 78%,rgba(255,255,255,.2) 100%)',
        }}
      />
    </div>
  );
}
