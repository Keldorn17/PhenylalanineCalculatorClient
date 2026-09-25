import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {TranslatePipe} from '../../translation/translation-pipe';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AuthService} from '../../auth/auth-service';
import {MenuItem} from '../navigation-types';

@Component({
  selector: 'sidenav-content',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatDividerModule, TranslatePipe, MatIconModule, MatTooltipModule],
  templateUrl: './sidenav-content.html',
  styleUrl: './sidenav-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavContent {
  public readonly isCollapsed = input(false);

  protected readonly menuItems = signal<MenuItem[]>([
    {
      icon: 'favorite',
      label: 'item 1',
      route: '/login'
    },
    {
      icon: 'favorite',
      label: 'item 2',
      route: '/register'
    },
    {
      icon: 'favorite',
      label: 'item 3',
      route: '/item3'
    },
    {
      icon: 'favorite',
      label: 'item 4',
      route: '/item4'
    },
  ]);
  protected readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected onLogout(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }

  protected navigate(route: string): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.router.navigate([route]);
  }
}
