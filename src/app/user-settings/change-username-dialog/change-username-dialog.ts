import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
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

export interface ChangeUsernameDialogData {
  currentUsername?: string;
}

@Component({
  selector: 'change-username-dialog',
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
  templateUrl: './change-username-dialog.html',
  styleUrl: './change-username-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeUsernameDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<ChangeUsernameDialog>);
  protected readonly data = inject<ChangeUsernameDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  protected readonly form: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly hidePassword = signal(true);
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

    const {username, password} = this.form.value;

    this.authService.changeUsername({username, password}).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        console.error('Failed to change username:', err);
        this.isLoading.set(false);
        this.errorMessage.set('settings.changeUsernameDialog.errorFailed');
      },
    });
  }
}
