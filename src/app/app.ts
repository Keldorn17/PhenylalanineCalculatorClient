import {Component, OnInit, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from './auth/auth-service';
import {UserService} from './user/user-service';
import {Navigation} from './navigation/navigation';
import {DailyLimitDialog} from './daily-limit-dialog/daily-limit-dialog';
import {Footer} from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly title = signal('PheSimple');

  constructor() {
    this.translateService.addLangs(['en', 'hu']);

    const savedLang = localStorage.getItem('lang');
    const browserLang = this.translateService.getBrowserLang();
    const initialLang =
      savedLang && ['en', 'hu'].includes(savedLang)
        ? savedLang
        : browserLang && ['en', 'hu'].includes(browserLang)
          ? browserLang
          : 'en';

    this.translateService.use(initialLang);
  }

  public ngOnInit(): void {
    this.authService.refresh().subscribe({
      next: (): void => {
        console.log('[Auth] Startup session restoration complete.');
        if (!this.router.url.includes('/register')) {
          this.userService.getUser().subscribe({
            next: (user): void => {
              if (!user.dailyLimit) {
                this.dialog.open(DailyLimitDialog, {
                  disableClose: true
                });
              }
            },
            error: (err: unknown): void => {
              console.error('[Auth] Failed to check user daily limit on startup:', err);
            }
          });
        }
      },
      error: (err: unknown): void => {
        console.log('[Auth] No active session on startup:', err);
      }
    });
  }
}
