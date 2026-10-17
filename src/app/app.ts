import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './auth/auth-service';
import { UserService } from './user/user-service';
import { DailyLimitDialog } from './daily-limit-dialog/daily-limit-dialog';
import { Navigation } from './navigation/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('PheSimple');

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    this.authService.refresh().subscribe({
      next: (): void => {
        console.log('[Auth] Startup session restoration complete.');
        if (!this.router.url.includes('/register')) {
          this.userService.getUser().subscribe({
            next: (user): void => {
              if (!user.dailyLimit) {
                this.dialog.open(DailyLimitDialog, {
                  width: '400px',
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
