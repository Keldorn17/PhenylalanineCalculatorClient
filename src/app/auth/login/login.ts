import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from '../auth-service';
import {UserService} from '../../user/user-service';
import {DailyLimitDialog} from '../../daily-limit-dialog/daily-limit-dialog';
import {TranslatePipe} from '../../translation/translation-pipe';
import {filter} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  protected readonly formBuilder = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  protected readonly userService = inject(UserService);
  protected readonly dialog = inject(MatDialog);
  protected readonly router = inject(Router);

  protected readonly loginForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hidePassword = signal(true);

  constructor() {
    this.loginForm.valueChanges
      .pipe(
        filter(() => this.errorMessage() !== null),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.errorMessage.set(null);
      });
  }

  protected loginClicked(): void {
    this.errorMessage.set(null);

    const {username, password} = this.loginForm.value;

    this.authService.login({username, password}).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.userService.getUser().subscribe({
          next: (user) => {
            if (!user.dailyLimit) {
              this.dialog.open(DailyLimitDialog, {
                disableClose: true,
              });
            }
          },
          error: (err) => {
            console.error('Failed to check user daily limit:', err);
          },
        });
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.errorMessage.set('login.errorInvalid');
      },
    });
  }
}
