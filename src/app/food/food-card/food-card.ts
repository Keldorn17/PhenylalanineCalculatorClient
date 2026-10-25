import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { FoodResponse } from '../food-types';
import { FoodService } from '../food-service';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { FoodDialog } from '../food-dialog/food-dialog';
import { CreateFoodConsumptionDialog } from '../../food-consumption/create-food-consumption-dialog/create-food-consumption-dialog';

@Component({
  selector: 'food-card',
  imports: [
    DecimalPipe,
    MatCard,
    MatCardContent,
    MatIconButton,
    MatIcon,
    MatTooltip,
    TranslatePipe,
    MatDivider,
  ],
  templateUrl: './food-card.html',
  styleUrl: './food-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodCard {
  private readonly dialog = inject(MatDialog);
  private readonly foodService = inject(FoodService);

  public readonly food = input.required<FoodResponse>();
  public readonly changed = output<void>();

  public openConsumeDialog(): void {
    this.dialog.open(CreateFoodConsumptionDialog, {
      data: {
        food: this.food(),
      },
    });
  }

  public openEditDialog(): void {
    const item = this.food();
    if (!item.canEdit) {
      return;
    }

    this.dialog
      .open(FoodDialog, {
        data: {
          food: item,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.changed.emit();
        }
      });
  }

  public openDeleteDialog(): void {
    const item = this.food();
    if (!item.canEdit) {
      return;
    }

    this.dialog
      .open(ConfirmDialog, {
        data: {
          titleTranslateKey: 'food.deleteDialog.title',
          detailsTranslateKey: 'food.deleteDialog.details',
          confirmTranslateKey: 'food.deleteDialog.delete',
          confirmClass: 'warn',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.foodService.deleteFood(item.id).subscribe(() => {
          this.changed.emit();
        });
      });
  }
}
