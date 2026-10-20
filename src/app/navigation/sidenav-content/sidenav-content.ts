import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {TranslatePipe} from '@ngx-translate/core';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly isCollapsed = input(false);

  protected readonly menuItems = signal<MenuItem[]>([
    {
      icon: 'home',
      label: 'nav.home',
      route: '/'
    },
    {
      icon: 'restaurant_menu',
      label: 'nav.foodTypes',
      route: '/food-types'
    }
  ]);
  protected readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  protected onLogout(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }
}
