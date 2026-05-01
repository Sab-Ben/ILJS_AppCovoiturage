import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'app_lang';
  private readonly DEFAULT_LANG = 'fr';
  private readonly SUPPORTED_LANGS = ['fr', 'en'];

  constructor(private translate: TranslateService) {}

  init(): void {
    this.translate.addLangs(this.SUPPORTED_LANGS);
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const saved = localStorage.getItem(this.STORAGE_KEY);
    const browserLang = this.translate.getBrowserLang() || this.DEFAULT_LANG;
    const langToUse = this.SUPPORTED_LANGS.includes(saved || '')
      ? saved!
      : this.SUPPORTED_LANGS.includes(browserLang)
        ? browserLang
        : this.DEFAULT_LANG;

    this.translate.use(langToUse);
    localStorage.setItem(this.STORAGE_KEY, langToUse);
  }

  switchLanguage(lang: string): void {
    if (!this.SUPPORTED_LANGS.includes(lang)) return;
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  getCurrentLang(): string {
    return this.translate.currentLang || this.DEFAULT_LANG;
  }

  getSupportedLangs(): string[] {
    return [...this.SUPPORTED_LANGS];
  }
}
