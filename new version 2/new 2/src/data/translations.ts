import { Language } from '../types';
import { getLocaleString, LOCALES } from '../locales';

export { LOCALES };

export function t(key: string, lang: Language): string {
  return getLocaleString(key, lang);
}
