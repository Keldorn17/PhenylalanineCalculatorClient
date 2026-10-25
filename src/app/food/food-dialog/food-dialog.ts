import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { FoodService } from '../food-service';
import { FoodRequest } from '../food-types';
import { FoodTypeService } from '../../food-type/food-type-service';
import { FoodTypeResponse } from '../../food-type/food-type-types';
import { FoodDialogData, PheInputMode } from './food-dialog-types';

@Component({
  selector: 'food-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    TranslatePipe,
  ],
  templateUrl: './food-dialog.html',
  styleUrl: './food-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodDialog implements OnInit {
  public readonly data = inject<FoodDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject(MatDialogRef<FoodDialog>);
  private readonly foodTypeService = inject(FoodTypeService);
  private readonly foodService = inject(FoodService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isEditMode = Boolean(this.data?.food);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = signal<boolean>(false);

  protected readonly pheMode = signal<PheInputMode>(this.isEditMode ? 'direct' : 'foodType');
  protected readonly foodTypes = signal<FoodTypeResponse[]>([]);
  protected readonly foodTypeSearchText = signal<string>(this.data?.food?.foodTypeName ?? '');
  protected readonly selectedFoodType = signal<FoodTypeResponse | null>(null);

  protected readonly filteredFoodTypes = computed(() => {
    const query = this.foodTypeSearchText().trim().toLowerCase();
    const all = this.foodTypes();
    if (!query) {
      return all;
    }
    return all.filter((item) => item.name.toLowerCase().includes(query));
  });

  protected readonly form: FormGroup = this.formBuilder.group({
    name: [this.data?.food?.name ?? '', [Validators.required, Validators.pattern(/\S+/)]],
    protein: [this.data?.food?.protein ?? null, [Validators.required, Validators.min(0)]],
    calories: [this.data?.food?.calories ?? null, [Validators.required, Validators.min(0)]],
    foodTypeSearch: [
      this.data?.food?.foodTypeName ?? '',
      this.isEditMode ? [] : [Validators.required],
    ],
    phenylalanine: [
      this.data?.food?.phenylalanine ?? null,
      this.isEditMode ? [Validators.required, Validators.min(0)] : [],
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

    this.form
      .get('foodTypeSearch')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value: string | FoodTypeResponse | null) => {
        if (typeof value === 'string') {
          this.foodTypeSearchText.set(value);
          const exactMatch = this.foodTypes().find(
            (item) => item.name.toLowerCase() === value.trim().toLowerCase(),
          );
          this.selectedFoodType.set(exactMatch ?? null);
        } else if (value && typeof value === 'object') {
          this.foodTypeSearchText.set(value.name);
          this.selectedFoodType.set(value);
        } else {
          this.foodTypeSearchText.set('');
          this.selectedFoodType.set(null);
        }
      });
  }

  public ngOnInit(): void {
    this.loadFoodTypes();
  }

  protected onPheModeChange(mode: PheInputMode): void {
    this.pheMode.set(mode);
    const foodTypeControl = this.form.get('foodTypeSearch');
    const pheControl = this.form.get('phenylalanine');

    if (mode === 'foodType') {
      foodTypeControl?.setValidators([Validators.required]);
      pheControl?.clearValidators();
    } else {
      foodTypeControl?.clearValidators();
      pheControl?.setValidators([Validators.required, Validators.min(0)]);
    }

    foodTypeControl?.updateValueAndValidity();
    pheControl?.updateValueAndValidity();
  }

  protected onFoodTypeSelected(event: MatAutocompleteSelectedEvent): void {
    const foodType = event.option.value as FoodTypeResponse;
    this.selectedFoodType.set(foodType);
    this.foodTypeSearchText.set(foodType.name);
    this.form.get('foodTypeSearch')?.setValue(foodType.name, { emitEvent: false });
  }

  protected clearFoodTypeSelection(): void {
    this.selectedFoodType.set(null);
    this.foodTypeSearchText.set('');
    this.form.get('foodTypeSearch')?.setValue('');
  }

  protected canSubmit(): boolean {
    if (this.form.invalid || this.isLoading()) {
      return false;
    }

    const searchVal = String(this.form.get('foodTypeSearch')?.value ?? '').trim();

    if (this.pheMode() === 'foodType') {
      return this.selectedFoodType() !== null;
    }

    return !(searchVal.length > 0 && this.selectedFoodType() === null);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected save(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const name = String(this.form.value.name).trim();
    const protein = Number(this.form.value.protein);
    const calories = Number(this.form.value.calories);
    const selectedType = this.selectedFoodType();

    if (this.isEditMode && this.data?.food) {
      const updatePayload: FoodRequest = {
        name,
        protein,
        calories,
      };
      if (selectedType) {
        updatePayload.foodTypeId = selectedType.id;
      }
      if (this.pheMode() === 'direct') {
        updatePayload.phenylalanine = Number(this.form.value.phenylalanine);
      }

      this.foodService.putFood(this.data.food.id, updatePayload).subscribe({
        next: (updated) => {
          this.isLoading.set(false);
          this.dialogRef.close(updated);
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('food.dialog.errorEditFailed');
        },
      });
      return;
    }

    const createPayload: FoodRequest = {
      name,
      protein,
      calories,
    };

    if (selectedType) {
      createPayload.foodTypeId = selectedType.id;
    }

    if (this.pheMode() === 'direct') {
      createPayload.phenylalanine = Number(this.form.value.phenylalanine);
    }

    this.foodService.postFood(createPayload).subscribe({
      next: (created) => {
        this.isLoading.set(false);
        this.dialogRef.close(created);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('food.dialog.errorCreateFailed');
      },
    });
  }

  private loadFoodTypes(): void {
    this.foodTypeService.getFoodTypes({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        this.foodTypes.set(response.content);
        const existingName = this.data?.food?.foodTypeName;
        if (existingName) {
          const match = response.content.find(
            (item) => item.name.toLowerCase() === existingName.toLowerCase(),
          );
          if (match) {
            this.selectedFoodType.set(match);
          }
        }
      },
    });
  }
}
