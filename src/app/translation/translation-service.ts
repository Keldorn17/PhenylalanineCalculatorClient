import {Injectable, signal} from '@angular/core';
import enTranslations from './en.json';
import huTranslations from './hu.json';

export type Language = 'en' | 'hu';

const translations: Record<Language, Record<string, unknown>> = {
  en: enTranslations as Record<string, unknown>,
  hu: huTranslations as Record<string, unknown>
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  public readonly currentLang;

  private readonly currentLangSignal = signal<Language>('en');

  constructor() {
    this.currentLang = this.currentLangSignal.asReadonly();

    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang === 'en' || savedLang === 'hu') {
      this.currentLangSignal.set(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (browserLang === 'en' || browserLang === 'hu') {
        this.currentLangSignal.set(browserLang);
      }
    }
  }

  public setLanguage(lang: Language): void {
    this.currentLangSignal.set(lang);
    localStorage.setItem('lang', lang);
  }

  public translate(key: string, params?: Record<string, string>): string {
    const lang = this.currentLangSignal();
    let current: unknown = translations[lang];
    for (const part of key.split('.')) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    let value = current;
    if (params) {
      for (const paramKey of Object.keys(params)) {
        value = value.replace(`{{${paramKey}}}`, params[paramKey]);
      }
    }

    return value;
  }
}
