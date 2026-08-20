import {Component, Input, signal} from '@angular/core';

@Component({
  selector: 'theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  @Input() public buttonClass = 'btn-circle';
  @Input() public iconClass = 'w-6 h-6';

  protected isDark = signal(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);

    this.isDark.set(isDarkTheme);
    this.applyTheme(isDarkTheme);
  }

  public toggleTheme(): void {
    const nextDark = !this.isDark();
    this.isDark.set(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    this.applyTheme(nextDark);
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.remove('dark');
    }
  }
}
