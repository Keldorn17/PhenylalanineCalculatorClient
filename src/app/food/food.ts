import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { FoodService } from './food-service';
import { FoodResponse } from './food-types';
import { FoodCard } from './food-card/food-card';
import { FoodDialog } from './food-dialog/food-dialog';
import { RsqlBuilder } from '../http/api-utils';

export interface SortOption {
  value: string;
  labelKey: string;
}

export interface SliderBounds {
  min: number;
  max: number;
  step: number;
}

@Component({
  selector: 'food',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatPaginator,
    MatProgressSpinner,
    MatBadgeModule,
    TranslatePipe,
    FoodCard,
  ],
  templateUrl: './food.html',
  styleUrl: './food.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Food implements OnInit {
  private readonly foodService = inject(FoodService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly totalElements = signal<number>(0);
  protected readonly foods = signal<FoodResponse[]>([]);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(20);
  protected readonly pageSizeOptions = [10, 20, 40, 50];

  protected readonly activeExtraFiltersCount = signal<number>(0);
  protected readonly showFilters = signal<boolean>(false);

  protected readonly sliderBounds: Record<
    'protein' | 'calories' | 'phe' | 'multiplier',
    SliderBounds
  > = {
    protein: { min: 0, max: 100, step: 1 },
    calories: { min: 0, max: 1000, step: 10 },
    phe: { min: 0, max: 5000, step: 25 },
    multiplier: { min: 0, max: 100, step: 1 },
  };

  protected readonly sortOptions: SortOption[] = [
    { value: '', labelKey: 'food.filters.sortDefault' },
    { value: 'name,asc', labelKey: 'food.filters.sortNameAsc' },
    { value: 'name,desc', labelKey: 'food.filters.sortNameDesc' },
    { value: 'phenylalanine,asc', labelKey: 'food.filters.sortPheAsc' },
    { value: 'phenylalanine,desc', labelKey: 'food.filters.sortPheDesc' },
    { value: 'protein,asc', labelKey: 'food.filters.sortProteinAsc' },
    { value: 'protein,desc', labelKey: 'food.filters.sortProteinDesc' },
    { value: 'calories,asc', labelKey: 'food.filters.sortCaloriesAsc' },
    { value: 'calories,desc', labelKey: 'food.filters.sortCaloriesDesc' },
  ];

  protected readonly filterForm: FormGroup = this.formBuilder.group({
    search: [''],
    onlyOwn: [false],
    sort: [''],
    proteinMin: [this.sliderBounds.protein.min],
    proteinMax: [this.sliderBounds.protein.max],
    caloriesMin: [this.sliderBounds.calories.min],
    caloriesMax: [this.sliderBounds.calories.max],
    pheMin: [this.sliderBounds.phe.min],
    pheMax: [this.sliderBounds.phe.max],
    multiplierMin: [this.sliderBounds.multiplier.min],
    multiplierMax: [this.sliderBounds.multiplier.max],
  });

  protected readonly hasSearchText = computed(() => {
    return Boolean(this.filterForm.get('search')?.value);
  });

  constructor() {
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadFoods();
      });
  }

  public ngOnInit(): void {
    this.loadFoods();
  }

  public toggleFilters(): void {
    this.showFilters.update((open) => !open);
  }

  public clearSearch(): void {
    this.filterForm.get('search')?.setValue('');
  }

  public applyFilters(): void {
    this.updateActiveFiltersCount();
    this.pageIndex.set(0);
    this.loadFoods();
  }

  public resetFilters(): void {
    const currentSearch = this.filterForm.get('search')?.value ?? '';
    this.filterForm.reset(
      {
        search: currentSearch,
        onlyOwn: false,
        sort: '',
        proteinMin: this.sliderBounds.protein.min,
        proteinMax: this.sliderBounds.protein.max,
        caloriesMin: this.sliderBounds.calories.min,
        caloriesMax: this.sliderBounds.calories.max,
        pheMin: this.sliderBounds.phe.min,
        pheMax: this.sliderBounds.phe.max,
        multiplierMin: this.sliderBounds.multiplier.min,
        multiplierMax: this.sliderBounds.multiplier.max,
      },
      { emitEvent: false },
    );
    this.updateActiveFiltersCount();
    this.pageIndex.set(0);
    this.loadFoods();
  }

  public openCreateDialog(): void {
    this.dialog
      .open(FoodDialog)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadFoods();
        }
      });
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadFoods();
  }

  public onFoodChanged(): void {
    this.loadFoods();
  }

  private updateActiveFiltersCount(): void {
    const val = this.filterForm.value;
    let count = 0;
    if (val.onlyOwn) count++;
    if (val.sort) count++;
    if (
      Number(val.proteinMin) > this.sliderBounds.protein.min ||
      Number(val.proteinMax) < this.sliderBounds.protein.max
    ) {
      count++;
    }
    if (
      Number(val.caloriesMin) > this.sliderBounds.calories.min ||
      Number(val.caloriesMax) < this.sliderBounds.calories.max
    ) {
      count++;
    }
    if (
      Number(val.pheMin) > this.sliderBounds.phe.min ||
      Number(val.pheMax) < this.sliderBounds.phe.max
    ) {
      count++;
    }
    if (
      Number(val.multiplierMin) > this.sliderBounds.multiplier.min ||
      Number(val.multiplierMax) < this.sliderBounds.multiplier.max
    ) {
      count++;
    }
    this.activeExtraFiltersCount.set(count);
  }

  private buildRsqlQuery(): string | undefined {
    const val = this.filterForm.value;
    const builder = RsqlBuilder.create();

    const addAndIfNeeded = (): void => {
      if (!builder.isEmpty()) {
        builder.and();
      }
    };

    const search = String(val.search ?? '').trim();
    if (search) {
      builder.group((groupBuilder) => {
        groupBuilder.ilike('name', search).or().ilike('foodTypeName', search);
      });
    }

    if (val.onlyOwn) {
      addAndIfNeeded();
      builder.eq('own', true);
    }

    const proteinMin = Number(val.proteinMin);
    const proteinMax = Number(val.proteinMax);
    if (proteinMin > this.sliderBounds.protein.min) {
      addAndIfNeeded();
      builder.ge('protein', proteinMin);
    }
    if (proteinMax < this.sliderBounds.protein.max) {
      addAndIfNeeded();
      builder.le('protein', proteinMax);
    }

    const caloriesMin = Number(val.caloriesMin);
    const caloriesMax = Number(val.caloriesMax);
    if (caloriesMin > this.sliderBounds.calories.min) {
      addAndIfNeeded();
      builder.ge('calories', caloriesMin);
    }
    if (caloriesMax < this.sliderBounds.calories.max) {
      addAndIfNeeded();
      builder.le('calories', caloriesMax);
    }

    const pheMin = Number(val.pheMin);
    const pheMax = Number(val.pheMax);
    if (pheMin > this.sliderBounds.phe.min) {
      addAndIfNeeded();
      builder.ge('phenylalanine', pheMin);
    }
    if (pheMax < this.sliderBounds.phe.max) {
      addAndIfNeeded();
      builder.le('phenylalanine', pheMax);
    }

    const multiplierMin = Number(val.multiplierMin);
    const multiplierMax = Number(val.multiplierMax);
    if (multiplierMin > this.sliderBounds.multiplier.min) {
      addAndIfNeeded();
      builder.ge('foodTypeMultiplier', multiplierMin);
    }
    if (multiplierMax < this.sliderBounds.multiplier.max) {
      addAndIfNeeded();
      builder.le('foodTypeMultiplier', multiplierMax);
    }

    const query = builder.build();
    return query.length > 0 ? query : undefined;
  }

  private loadFoods(): void {
    this.isLoading.set(true);
    const query = this.buildRsqlQuery();
    const sort = this.filterForm.value.sort ? String(this.filterForm.value.sort) : undefined;

    this.foodService
      .getFoods({
        page: this.pageIndex(),
        size: this.pageSize(),
        query,
        sort,
      })
      .subscribe({
        next: (response) => {
          if (
            response.content.length === 0 &&
            this.pageIndex() > 0 &&
            response.page.totalElements > 0
          ) {
            this.pageIndex.set(this.pageIndex() - 1);
            this.loadFoods();
            return;
          }
          this.foods.set(response.content);
          this.totalElements.set(response.page.totalElements);
          this.isLoading.set(false);
        },
        error: () => {
          this.foods.set([]);
          this.totalElements.set(0);
          this.isLoading.set(false);
        },
      });
  }
}
