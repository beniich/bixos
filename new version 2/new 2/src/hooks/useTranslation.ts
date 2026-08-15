import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Language } from '../types';
import { LOCALES, getLocaleString } from '../locales';

/**
 * Custom hook that uses the Language context to return a function `t(key: string)`
 * that looks up strings from the central `src/locales/` directory JSON files.
 */
export function useTranslation(overrideLang?: Language) {
  const context = useContext(LanguageContext);
  const activeLang = overrideLang || context?.language || 'FR';

  const t = (key: string, lang?: Language) => getLocaleString(key, lang || activeLang);
  const dictionary = (context?.locales || LOCALES)[activeLang] || LOCALES.FR;

  return {
    t,
    language: activeLang,
    setLanguage: context?.setLanguage,
    dictionary,
    locales: context?.locales || LOCALES,
  };
}

export default useTranslation;
