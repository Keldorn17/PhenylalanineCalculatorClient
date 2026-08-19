import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('PhenylalanineCalculatorClient');

  private readonly authService = inject(AuthService);

  public ngOnInit(): void {
    this.authService.refresh().subscribe({
      next: (): void => {
        console.log('[Auth] Startup session restoration complete.');
      },
      error: (err: unknown): void => {
        console.log('[Auth] No active session on startup:', err);
      }
    });
  }
}
