import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {ThemeToggle} from '../theme-toggle/theme-toggle';
import {NavPath, parseNavPath, NavItem} from './navigation-path';
import {AuthService} from '../auth/auth-service';
import {TranslationService, Language} from '../translation/translation-service';
import {TranslatePipe} from '../translation/translation-pipe';
import {UserSettings} from '../user-settings/user-settings';

@Component({
  selector: 'navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    ThemeToggle,
    TranslatePipe,
    UserSettings
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navigation {
  protected readonly authService = inject(AuthService);
  protected readonly translationService = inject(TranslationService);
  protected readonly navItems: NavItem[] = parseNavPath(NavPath);

  protected closeDropdown(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  protected setLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }
}
