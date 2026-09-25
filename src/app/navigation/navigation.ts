import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {SidenavContent} from './sidenav-content/sidenav-content';
import {TranslatePipe} from '../translation/translation-pipe';
import {UserSettings} from '../user-settings/user-settings';

@Component({
  selector: 'navigation',
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    SidenavContent,
    TranslatePipe,
    UserSettings,
    MatButton,
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navigation {
  protected readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly router = inject(Router);

  protected readonly isCollapsed = signal(false);
  protected readonly mobileOpened = signal(false);

  private readonly mobileWidth: number = 768;
  protected readonly sideBarMaxWidth: number = 250;
  protected readonly sideBarCollapsedWidth: number = 68;

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(`(max-width: ${this.mobileWidth}px)`).pipe(map(result => result.matches)),
    {initialValue: typeof window !== 'undefined' ? window.innerWidth <= this.mobileWidth : false}
  );


  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      if (this.isMobile()) {
        this.mobileOpened.set(false);
      }
    });
  }

  protected toggleCollapse(): void {
    this.isCollapsed.update(collapsed => !collapsed);
  }

  protected toggleMobileSidenav(): void {
    this.mobileOpened.update(opened => !opened);
  }

  protected onMobileOpenedChange(opened: boolean): void {
    if (this.isMobile()) {
      this.mobileOpened.set(opened);
    }
  }

  protected navigateHome(): void {
    this.router.navigate(['/']);
  }
}
