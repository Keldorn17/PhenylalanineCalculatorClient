import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { FoodTypeService } from './food-type-service';
import { FoodTypeResponse } from './food-type-types';
import { FoodTypeCard } from './food-type-card/food-type-card';
import { FoodTypeDialog } from './food-type-dialog/food-type-dialog';

@Component({
  selector: 'food-type',
  imports: [
    MatCard,
    MatCardContent,
    MatButton,
    MatIcon,
    MatPaginator,
    MatProgressSpinner,
    TranslatePipe,
    FoodTypeCard,
  ],
  templateUrl: './food-type.html',
  styleUrl: './food-type.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodType implements OnInit {
  private readonly foodTypeService = inject(FoodTypeService);
  private readonly dialog = inject(MatDialog);

  protected readonly foodTypes = signal<FoodTypeResponse[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly totalElements = signal<number>(0);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(20);
  protected readonly pageSizeOptions = [10, 20, 40, 50];

  public ngOnInit(): void {
    this.loadFoodTypes();
  }

  public openCreateDialog(): void {
    this.dialog
      .open(FoodTypeDialog)
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadFoodTypes();
        }
      });
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadFoodTypes();
  }

  public onFoodTypeChanged(): void {
    this.loadFoodTypes();
  }

  private loadFoodTypes(): void {
    this.isLoading.set(true);
    this.foodTypeService
      .getFoodTypes({
        page: this.pageIndex(),
        size: this.pageSize(),
      })
      .subscribe({
        next: (response) => {
          if (
            response.content.length === 0 &&
            this.pageIndex() > 0 &&
            response.page.totalElements > 0
          ) {
            this.pageIndex.set(this.pageIndex() - 1);
            this.loadFoodTypes();
            return;
          }
          this.foodTypes.set(response.content);
          this.totalElements.set(response.page.totalElements);
          this.isLoading.set(false);
        },
        error: () => {
          this.foodTypes.set([]);
          this.totalElements.set(0);
          this.isLoading.set(false);
        },
      });
  }
}
