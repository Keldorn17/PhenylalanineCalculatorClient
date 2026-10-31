import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { FoodTypeService } from '../food-type-service';
import { FoodTypeDialogData } from './food-type-dialog-types';

@Component({
  selector: 'food-type-dialog',
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
  templateUrl: './food-type-dialog.html',
  styleUrl: './food-type-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodTypeDialog {
  public readonly data = inject<FoodTypeDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<FoodTypeDialog>);
  private readonly foodTypeService = inject(FoodTypeService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isEditMode = Boolean(this.data?.foodType);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  protected readonly form: FormGroup = this.formBuilder.group({
    name: [this.data?.foodType?.name ?? '', [Validators.required, Validators.pattern(/\S+/)]],
    multiplier: [
      this.data?.foodType?.multiplier ?? null,
      [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
    ],
  });

  constructor() {
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

    const payload = {
      name: String(this.form.value.name).trim(),
      multiplier: Number(this.form.value.multiplier),
    };

    const request$ =
      this.isEditMode && this.data?.foodType
        ? this.foodTypeService.putFoodType(this.data.foodType.id, payload)
        : this.foodTypeService.postFoodType(payload);

    request$.subscribe({
      next: (result) => {
        this.isLoading.set(false);
        this.dialogRef.close(result);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(
          this.isEditMode
            ? 'foodType.dialog.errorEditFailed'
            : 'foodType.dialog.errorCreateFailed',
        );
      },
    });
  }
}
