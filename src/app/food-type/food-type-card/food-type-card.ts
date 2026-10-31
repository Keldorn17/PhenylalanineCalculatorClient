import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { FoodTypeResponse } from '../food-type-types';
import { FoodTypeService } from '../food-type-service';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { FoodTypeDialog } from '../food-type-dialog/food-type-dialog';

@Component({
  selector: 'food-type-card',
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
  templateUrl: './food-type-card.html',
  styleUrl: './food-type-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodTypeCard {
  private readonly foodTypeService = inject(FoodTypeService);
  private readonly dialog = inject(MatDialog);

  public readonly foodType = input.required<FoodTypeResponse>();
  public readonly changed = output<void>();

  public openEditDialog(): void {
    const item = this.foodType();
    if (!item.canEdit) {
      return;
    }

    this.dialog
      .open(FoodTypeDialog, {
        data: {
          foodType: item,
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
    const item = this.foodType();
    if (!item.canEdit) {
      return;
    }

    this.dialog
      .open(ConfirmDialog, {
        data: {
          titleTranslateKey: 'foodType.deleteDialog.title',
          detailsTranslateKey: 'foodType.deleteDialog.details',
          confirmTranslateKey: 'foodType.deleteDialog.delete',
          confirmClass: 'warn',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.foodTypeService.deleteFoodType(item.id).subscribe(() => {
          this.changed.emit();
        });
      });
  }
}
