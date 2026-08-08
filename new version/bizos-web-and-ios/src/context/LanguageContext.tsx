import React, { createContext, useContext } from 'react';
import { Language } from '../types';
import { LOCALES, getLocaleString } from '../locales';

export interface LanguageContextType {
  language: Language;
  setLanguage?: (lang: Language) => void;
  t: (key: string, lang?: Language) => string;
  dictionary: Record<string, string>;
  locales: Record<Language, Record<string, string>>;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  t: (key: string, lang?: Language) => getLocaleString(key, lang || 'EN'),
  dictionary: LOCALES.EN,
  locales: LOCALES,
});

export const LanguageProvider: React.FC<{
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  children: React.ReactNode;
}> = ({ language, onLanguageChange, children }) => {
  const dictionary = LOCALES[language] || LOCALES.EN;
  const t = (key: string, lang?: Language) => getLocaleString(key, lang || language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: onLanguageChange,
        t,
        dictionary,
        locales: LOCALES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguageContext() {
  return useContext(LanguageContext);
}
