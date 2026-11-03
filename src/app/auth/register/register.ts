import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, merge } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth-service';
import { UserService } from '../../user/user-service';
import { DailyLimitDialog } from '../../daily-limit-dialog/daily-limit-dialog';
import { passwordMatchValidator, passwordValidator } from '../../validator/password-validator';
import { usernameValidator } from '../../validator/username-validator';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'register',
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
    MatCheckboxModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly currentStep = signal<2 | 3>(2);
  protected readonly isRegistered = signal(false);

  protected readonly registerForm: FormGroup = this.formBuilder.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, usernameValidator]],
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    },
    {
      validators: [passwordMatchValidator]
    }
  );

  protected readonly dailyLimitForm: FormGroup = this.formBuilder.group({
    dailyLimit: [null, [Validators.required, Validators.min(1)]]
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hidePassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);

  constructor() {
    merge(this.registerForm.valueChanges, this.dailyLimitForm.valueChanges)
      .pipe(
        filter(() => this.errorMessage() !== null),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.errorMessage.set(null);
      });
  }

  protected nextStepClicked(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.errorMessage.set(null);
    this.currentStep.set(3);
  }

  protected previousStepClicked(): void {
    this.errorMessage.set(null);
    this.currentStep.set(2);
  }

  protected skipDailyLimitClicked(): void {
    this.errorMessage.set(null);

    if (this.isRegistered()) {
      this.checkDailyLimitAndNavigate();
      return;
    }

    const {email, username, password} = this.registerForm.value;

    this.authService.register({email, username, password}).subscribe({
      next: () => {
        this.isRegistered.set(true);
        this.checkDailyLimitAndNavigate();
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.currentStep.set(2);
        this.errorMessage.set('register.errorFailed');
      }
    });
  }

  protected saveDailyLimitClicked(): void {
    if (this.dailyLimitForm.invalid) {
      return;
    }

    this.errorMessage.set(null);

    const dailyLimit = Number(this.dailyLimitForm.value.dailyLimit);

    if (this.isRegistered()) {
      this.userService.patchUser({dailyLimit}).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Failed to set daily limit:', err);
          this.errorMessage.set('register.errorDailyLimitFailed');
        }
      });
      return;
    }

    const {email, username, password} = this.registerForm.value;

    this.authService
      .register({email, username, password})
      .pipe(
        tap(() => {
          this.isRegistered.set(true);
        }),
        catchError((err) => {
          console.error('Registration failed:', err);
          this.currentStep.set(2);
          this.errorMessage.set('register.errorFailed');
          return EMPTY;
        }),
        switchMap(() => this.userService.patchUser({dailyLimit}))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Failed to set daily limit:', err);
          this.errorMessage.set('register.errorDailyLimitFailed');
        }
      });
  }

  private checkDailyLimitAndNavigate(): void {
    this.router.navigate(['/']);
    this.userService.getUser().subscribe({
      next: (user) => {
        if (!user.dailyLimit) {
          this.dialog.open(DailyLimitDialog, {
            disableClose: true
          });
        }
      },
      error: (err) => {
        console.error('Failed to check user daily limit:', err);
      }
    });
  }
}
