import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {OverlayModule, ConnectedPosition} from '@angular/cdk/overlay';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {AuthService} from '../auth/auth-service';
import {ThemeService} from '../theme/theme-service';
import {TranslationService, Language} from '../translation/translation-service';
import {TranslatePipe} from '../translation/translation-pipe';
import {LanguageOption} from './user-settings-types';

@Component({
  selector: 'user-settings',
  imports: [
    RouterLink,
    OverlayModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslatePipe,
  ],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettings {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly translationService = inject(TranslationService);

  protected readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  protected readonly isDark = this.themeService.isDark;
  protected readonly currentLang = this.translationService.currentLang;

  protected readonly isOpen = signal(false);
  protected readonly currentView = signal<'main' | 'language'>('main');

  protected readonly languages: LanguageOption[] = [
    {code: 'en', label: 'language.english'},
    {code: 'hu', label: 'language.hungarian'},
  ];

  protected readonly positions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 8,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -8,
    },
  ];

  protected toggleMenu(): void {
    this.isOpen.update(open => !open);
    if (!this.isOpen()) {
      this.currentView.set('main');
    }
  }

  protected closeMenu(): void {
    this.isOpen.set(false);
    this.currentView.set('main');
  }

  protected openLanguageView(): void {
    this.currentView.set('language');
  }

  protected backToMainView(): void {
    this.currentView.set('main');
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  protected changeUsername(): void {
    this.closeMenu();
  }

  protected changePassword(): void {
    this.closeMenu();
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }
}
