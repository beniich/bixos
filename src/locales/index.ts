import { Language } from '../types';
import fr from './fr.json';
import en from './en.json';
import de from './de.json';
import es from './es.json';

export const LOCALES: Record<Language, Record<string, string>> = {
  FR: fr,
  EN: en,
  DE: de,
  ES: es,
};

export function getLocaleString(key: string, language: Language): string {
  const langDict = LOCALES[language] || LOCALES.EN;
  if (langDict && langDict[key]) {
    return langDict[key];
  }
  const fallbackDict = LOCALES.EN;
  if (fallbackDict && fallbackDict[key]) {
    return fallbackDict[key];
  }
  return key;
}
