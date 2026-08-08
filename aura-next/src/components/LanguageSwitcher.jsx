'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { LANGUAGES, useLanguage } from '../lib/i18n/LanguageContext.jsx';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={t('common.language')}
        className="icon-btn flex h-10 flex-none items-center gap-1.5 px-3 text-[12.5px] font-semibold"
      >
        <Icon name="globe" size={16} />
        {active.short}
      </button>

      {open && (
        <div className="glass-card absolute right-0 top-[calc(100%+8px)] z-20 w-40 overflow-hidden p-1.5">
          {LANGUAGES.map((l) => (
            <span
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`block cursor-pointer rounded-lg px-3 py-2 text-[13px] ${l.code === language ? 'font-semibold text-brand' : 'text-body'}`}
            >
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
