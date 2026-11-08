import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { DateTimePicker } from '../../date-time-picker/date-time-picker';
import { FoodConsumptionService } from '../food-consumption-service';
import { ProgressBarService } from '../../progress-bar/progress-bar-service';
import { CreateFoodConsumptionDialogData } from './create-food-consumption-dialog-types';

@Component({
  selector: 'create-food-consumption-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DateTimePicker,
    TranslatePipe
  ],
  templateUrl: './create-food-consumption-dialog.html',
  styleUrl: './create-food-consumption-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateFoodConsumptionDialog {
  public readonly data = inject<CreateFoodConsumptionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CreateFoodConsumptionDialog>);
  private readonly foodConsumptionService = inject(FoodConsumptionService);
  private readonly progressBarService = inject(ProgressBarService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly consumedAtControl = new FormControl<Date | null>(this.getInitialConsumedAt(), [
    Validators.required
  ]);

  protected readonly form: FormGroup = this.formBuilder.group({
    amount: [null, [Validators.required, Validators.min(0.1)]],
    consumedAt: this.consumedAtControl
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

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

  protected save(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const amount = Number(this.form.value.amount);
    const consumedAt = new Date(this.form.value.consumedAt as Date);
    consumedAt.setSeconds(0, 0);

    this.foodConsumptionService
      .postFoodConsumption({
        foodId: this.data.food.id,
        amount,
        consumedAt
      })
      .subscribe({
        next: (created) => {
          this.isLoading.set(false);
          this.progressBarService.triggerRefresh(consumedAt);
          this.dialogRef.close(created);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('consumption.createDialog.errorFailed');
        }
      });
  }

  private getInitialConsumedAt(): Date {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  }
}
