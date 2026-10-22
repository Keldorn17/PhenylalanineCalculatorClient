import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FoodConsumptionService } from '../food-consumption-service';
import { ProgressBarService } from '../../progress-bar/progress-bar-service';
import { EditFoodConsumptionDialogData } from './edit-food-consumption-dialog-types';

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
    MatDatepickerModule,
    MatTimepickerModule,
    TranslatePipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-food-consumption-dialog.html',
  styleUrl: './edit-food-consumption-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFoodConsumptionDialog {
  public readonly data = inject<EditFoodConsumptionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditFoodConsumptionDialog>);
  private readonly foodConsumptionService = inject(FoodConsumptionService);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly progressBarService = inject(ProgressBarService);
  private readonly translateService = inject(TranslateService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly currentLang = this.translateService.currentLang;

  private readonly initialConsumedAt = this.getInitialConsumedAt();

  protected readonly form: FormGroup = this.formBuilder.group({
    amount: [this.data?.consumption?.amount ?? null, [Validators.required, Validators.min(0.1)]],
    date: [this.initialConsumedAt, [Validators.required]],
    time: [this.initialConsumedAt, [Validators.required]],
  });

  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const lang = this.currentLang() ?? 'en';
      this.dateAdapter.setLocale(lang === 'hu' ? 'hu-HU' : 'en-US');
    });

    this.form.valueChanges
      .pipe(
        filter(() => this.errorMessage() !== null),
        takeUntilDestroyed(),
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
    const consumedAt = this.getConsumedAt(this.form.value.date as Date, this.form.value.time as Date);

    this.foodConsumptionService
      .putFoodConsumption(this.data.consumption.id, { amount, consumedAt })
      .subscribe({
        next: (updated) => {
          this.progressBarService.triggerRefresh();
          this.dialogRef.close(updated);
        },
        error: () => {
          this.errorMessage.set('consumption.editDialog.errorFailed');
        },
      });
  }

  private getConsumedAt(date: Date, time: Date): Date {
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(time.getSeconds());

    return date;
  }

  private getInitialConsumedAt(): Date {
    const raw = this.data?.consumption?.consumedAt;
    if (!raw) {
      return new Date();
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}
