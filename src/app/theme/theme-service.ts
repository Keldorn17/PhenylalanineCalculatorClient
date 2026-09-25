import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public readonly isDark;
  private readonly isDarkSignal = signal(false);

  constructor() {
    this.isDark = this.isDarkSignal.asReadonly();
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.isDarkSignal.set(isDarkTheme);
    this.applyTheme(isDarkTheme);
  }

  public toggleTheme(): void {
    const nextDark = !this.isDarkSignal();
    this.isDarkSignal.set(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    this.applyTheme(nextDark);
  }

  public setTheme(isDark: boolean): void {
    this.isDarkSignal.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark');
      htmlElement.style.colorScheme = 'dark';
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.remove('dark');
      htmlElement.style.colorScheme = 'light';
    }
  }
}
