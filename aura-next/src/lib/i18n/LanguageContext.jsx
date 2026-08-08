'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.js';
import ru from './ru.js';
import uz from './uz.js';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'uz', label: 'Oʻzbekcha', short: 'UZ' },
];

const DICTS = { en, ru, uz };
const LOCALE_TAGS = { en: 'en-US', ru: 'ru-RU', uz: 'uz-Latn-UZ' };
const STORAGE_KEY = 'aura-language';

function lookup(dict, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    async function loadSaved() {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      await null;
      if (saved && DICTS[saved]) setLanguageState(saved);
    }
    loadSaved();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }, [language]);

  function setLanguage(code) {
    if (!DICTS[code]) return;
    setLanguageState(code);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, code);
  }

  const value = useMemo(() => {
    const dict = DICTS[language];
    function t(key, vars) {
      const value = lookup(dict, key) ?? lookup(en, key) ?? key;
      return typeof value === 'string' ? interpolate(value, vars) : value;
    }
    return { language, setLanguage, t, locale: LOCALE_TAGS[language] };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
