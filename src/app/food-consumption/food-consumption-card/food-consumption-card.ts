import {ChangeDetectionStrategy, Component, inject, input, output} from '@angular/core';
import {DatePipe, DecimalPipe} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {FoodConsumptionResponse} from '../food-consumption-types';
import {FoodConsumptionService} from '../food-consumption-service';
import {ProgressBarService} from '../../progress-bar/progress-bar-service';
import {ConfirmDialog} from '../../confirm-dialog/confirm-dialog';
import {EditFoodConsumptionDialog} from '../edit-food-consumption-dialog/edit-food-consumption-dialog';
import {MatDivider} from '@angular/material/list';

@Component({
  selector: 'food-consumption-card',
  imports: [
    DatePipe,
    DecimalPipe,
    MatCard,
    MatCardContent,
    MatIconButton,
    MatIcon,
    MatTooltip,
    TranslatePipe,
    MatDivider
  ],
  templateUrl: './food-consumption-card.html',
  styleUrl: './food-consumption-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FoodConsumptionCard {
  private readonly dialog = inject(MatDialog);
  private readonly foodConsumptionService = inject(FoodConsumptionService);
  private readonly progressBarService = inject(ProgressBarService);

  public readonly consumption = input.required<FoodConsumptionResponse>();
  public readonly changed = output<void>();

  public openEditDialog(): void {
    this.dialog
      .open(EditFoodConsumptionDialog, {
        data: {
          consumption: this.consumption()
        }
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.changed.emit();
        }
      });
  }

  public openDeleteDialog(): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titleTranslateKey: 'consumption.deleteDialog.title',
          detailsTranslateKey: 'consumption.deleteDialog.details',
          confirmTranslateKey: 'consumption.deleteDialog.delete',
          confirmClass: 'warn'
        }
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        const item = this.consumption();
        this.foodConsumptionService.deleteFoodConsumption(item.id).subscribe(() => {
          this.progressBarService.triggerRefresh(new Date(item.consumedAt));
          this.changed.emit();
        });
      });
  }
}
