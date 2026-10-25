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
    MatDatepickerModule,
    MatTimepickerModule,
    TranslatePipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-food-consumption-dialog.html',
  styleUrl: './create-food-consumption-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateFoodConsumptionDialog {
  public readonly data = inject<CreateFoodConsumptionDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CreateFoodConsumptionDialog>);
  private readonly foodConsumptionService = inject(FoodConsumptionService);
  private readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly progressBarService = inject(ProgressBarService);
  private readonly translateService = inject(TranslateService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly currentLang = this.translateService.currentLang;

  private readonly now = new Date();

  protected readonly form: FormGroup = this.formBuilder.group({
    amount: [null, [Validators.required, Validators.min(0.1)]],
    date: [new Date(this.now), [Validators.required]],
    time: [new Date(this.now), [Validators.required]],
  });

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

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
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const amount = Number(this.form.value.amount);
    const consumedAt = this.getConsumedAt(
      new Date(this.form.value.date as Date),
      this.form.value.time as Date,
    );

    this.foodConsumptionService
      .postFoodConsumption({
        foodId: this.data.food.id,
        amount,
        consumedAt,
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
        },
      });
  }

  private getConsumedAt(date: Date, time: Date): Date {
    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(time.getSeconds());

    return date;
  }
}
