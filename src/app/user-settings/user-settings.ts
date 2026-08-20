import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth-service';
import {TranslationService, Language} from '../translation/translation-service';
import {TranslatePipe} from '../translation/translation-pipe';
import {ThemeToggle} from '../theme-toggle/theme-toggle';

@Component({
  selector: 'user-settings',
  imports: [
    TranslatePipe,
    ThemeToggle
  ],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettings {
  protected readonly authService = inject(AuthService);
  protected readonly translationService = inject(TranslationService);
  protected readonly isDark = signal(false);
  private readonly router = inject(Router);

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.isDark.set(isDarkTheme);
  }

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout success.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/']);
      }
    });
  }

  protected setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  protected changePassword(): void {
    console.log('Change password clicked (no-op)');
  }

  protected changeUsername(): void {
    console.log('Change username clicked (no-op)');
  }

  protected closeDropdown(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
}
