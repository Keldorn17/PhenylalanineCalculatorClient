import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {filter} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UserService} from '../user/user-service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-daily-limit-dialog',
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
  templateUrl: './daily-limit-dialog.html',
  styleUrl: './daily-limit-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyLimitDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<DailyLimitDialog>);

  protected readonly dailyLimitForm: FormGroup = this.formBuilder.group({
    dailyLimit: [null, [Validators.required, Validators.min(1)]],
  });

  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.dailyLimitForm.valueChanges
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

  protected save(): void {
    if (this.dailyLimitForm.invalid) {
      return;
    }

    this.errorMessage.set(null);
    const dailyLimit = Number(this.dailyLimitForm.value.dailyLimit);

    this.userService.patchUser({dailyLimit}).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Failed to update daily limit:', err);
        this.errorMessage.set('register.errorDailyLimitFailed');
      }
    });
  }
}
