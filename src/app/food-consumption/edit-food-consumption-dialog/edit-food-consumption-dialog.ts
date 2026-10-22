import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs/operators';
import {TranslatePipe} from '@ngx-translate/core';
import {FoodConsumptionService} from '../food-consumption-service';
import {ProgressBarService} from '../../progress-bar/progress-bar-service';
import {EditFoodConsumptionDialogData} from './edit-food-consumption-dialog-types';

@Component({
  selector: 'edit-food-consumption-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './edit-food-consumption-dialog.html',
  styleUrl: './edit-food-consumption-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditFoodConsumptionDialog {
  public readonly data = inject<EditFoodConsumptionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditFoodConsumptionDialog>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly foodConsumptionService = inject(FoodConsumptionService);
  private readonly progressBarService = inject(ProgressBarService);

  protected readonly form: FormGroup = this.formBuilder.group({
    amount: [this.data?.consumption?.amount ?? null, [Validators.required, Validators.min(0.1)]]
  });

  protected readonly errorMessage = signal<string | null>(null);

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const amount = Number(this.form.value.amount);
    const consumedAt = new Date(this.data.consumption.consumedAt);

    this.foodConsumptionService
      .putFoodConsumption(this.data.consumption.id, {amount, consumedAt})
      .subscribe({
        next: updated => {
          this.progressBarService.triggerRefresh(consumedAt);
          this.dialogRef.close(updated);
        },
        error: () => {
          this.errorMessage.set('consumption.editDialog.errorFailed');
        }
      });
  }
}
