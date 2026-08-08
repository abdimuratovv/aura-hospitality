function Svg({ s, children }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function Icon({ name, size }) {
  const s = size || 20;
  switch (name) {
    case 'dashboard':
      return <Svg s={s}><rect x={3} y={3} width={7} height={7} rx={1.5} /><rect x={14} y={3} width={7} height={4} rx={1.5} /><rect x={14} y={11} width={7} height={10} rx={1.5} /><rect x={3} y={14} width={7} height={7} rx={1.5} /></Svg>;
    case 'audit':
      return <Svg s={s}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>;
    case 'fraud':
      return <Svg s={s}><path d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6Z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={16} x2={12} y2={16.2} /></Svg>;
    case 'leakage':
      return <Svg s={s}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /><path d="M9 15a3 3 0 0 0 3 3" /></Svg>;
    case 'alerts':
      return <Svg s={s}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Svg>;
    case 'transactions':
      return <Svg s={s}><path d="M7 8h13M7 8 10 5M7 8l3 3" /><path d="M17 16H4m13 0-3-3m3 3-3 3" /></Svg>;
    case 'employees':
      return <Svg s={s}><circle cx={9} cy={8} r={3.2} /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.4" /><path d="M17 20a6 6 0 0 0-2.5-4.9" /></Svg>;
    case 'reports':
      return <Svg s={s}><rect x={4} y={3} width={16} height={18} rx={2} /><line x1={8} y1={8} x2={16} y2={8} /><line x1={8} y1={12} x2={16} y2={12} /><line x1={8} y1={16} x2={12} y2={16} /></Svg>;
    case 'settings':
      return <Svg s={s}><circle cx={12} cy={12} r={3} /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></Svg>;
    case 'collapse':
      return <Svg s={s}><rect x={3} y={4} width={18} height={16} rx={3} /><line x1={9} y1={4} x2={9} y2={20} /></Svg>;
    case 'expand':
      return <Svg s={s}><rect x={3} y={4} width={18} height={16} rx={3} /><line x1={15} y1={4} x2={15} y2={20} /></Svg>;
    case 'search':
      return <Svg s={s}><circle cx={11} cy={11} r={7} /><line x1={21} y1={21} x2={16.65} y2={16.65} /></Svg>;
    case 'bell':
      return <Svg s={s}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Svg>;
    case 'theme':
      return <Svg s={s}><circle cx={12} cy={12} r={4} /><line x1={12} y1={2} x2={12} y2={4} /><line x1={12} y1={20} x2={12} y2={22} /><line x1={4.9} y1={4.9} x2={6.3} y2={6.3} /><line x1={17.7} y1={17.7} x2={19.1} y2={19.1} /><line x1={2} y1={12} x2={4} y2={12} /><line x1={20} y1={12} x2={22} y2={12} /><line x1={4.9} y1={19.1} x2={6.3} y2={17.7} /><line x1={17.7} y1={6.3} x2={19.1} y2={4.9} /></Svg>;
    case 'chevron':
      return <Svg s={s}><path d="M6 9l6 6 6-6" /></Svg>;
    case 'hotel':
      return <Svg s={s}><path d="M3 21h18" /><path d="M5 21V5l7-2 7 2v16" /><line x1={9} y1={8} x2={9} y2={8.2} /><line x1={15} y1={8} x2={15} y2={8.2} /><line x1={9} y1={12} x2={9} y2={12.2} /><line x1={15} y1={12} x2={15} y2={12.2} /><path d="M10 21v-4h4v4" /></Svg>;
    case 'export':
      return <Svg s={s}><path d="M12 15V3" /><path d="M8 7l4-4 4 4" /><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></Svg>;
    case 'spark':
      return <Svg s={s}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" /></Svg>;
    case 'revenue':
      return <Svg s={s}><path d="M12 2v20" /><path d="M16 6H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H7" /></Svg>;
    case 'drop':
      return <Svg s={s}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></Svg>;
    case 'moon':
      return <Svg s={s}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Svg>;
    case 'shield':
      return <Svg s={s}><path d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6Z" /></Svg>;
    case 'menu':
      return <Svg s={s}><line x1={3} y1={6} x2={21} y2={6} /><line x1={3} y1={12} x2={21} y2={12} /><line x1={3} y1={18} x2={21} y2={18} /></Svg>;
    case 'globe':
      return <Svg s={s}><circle cx={12} cy={12} r={9} /><line x1={3} y1={12} x2={21} y2={12} /><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z" /></Svg>;
    default:
      return <Svg s={s}><circle cx={12} cy={12} r={9} /></Svg>;
  }
}
