import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {AuthService} from '../../auth/auth-service';
import {passwordMatchValidator, passwordValidator} from '../../validator/password-validator';

@Component({
  selector: 'change-password-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './change-password-dialog.html',
  styleUrl: './change-password-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<ChangePasswordDialog>);

  protected readonly form: FormGroup = this.formBuilder.group(
    {
      oldPassword: ['', [Validators.required]],
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [passwordMatchValidator],
    }
  );

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hideConfirmPassword = signal(true);
  protected readonly hideOldPassword = signal(true);
  protected readonly hideNewPassword = signal(true);
  protected readonly isLoading = signal(false);

  constructor() {
    this.form.valueChanges
      .pipe(
        filter(() => this.errorMessage() !== null),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.errorMessage.set(null);
      });
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected submit(): void {
    if (this.form.invalid || this.isLoading()) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const {oldPassword, password} = this.form.value;

    this.authService.changePassword({oldPassword, password}).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        console.error('Failed to change password:', err);
        this.isLoading.set(false);
        this.errorMessage.set('settings.changePasswordDialog.errorFailed');
      },
    });
  }
}
