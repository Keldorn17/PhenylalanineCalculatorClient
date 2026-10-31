import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ProgressBar} from '../progress-bar/progress-bar';
import {DateSwitcher} from '../date-switcher/date-switcher';
import {FoodConsumptionCard} from '../food-consumption/food-consumption-card/food-consumption-card';
import {FoodConsumptionResponse} from '../food-consumption/food-consumption-types';

@Component({
  selector: 'landing',
  imports: [
    DatePipe,
    RouterLink,
    MatButton,
    MatIcon,
    TranslatePipe,
    ProgressBar,
    DateSwitcher,
    FoodConsumptionCard,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  private readonly translateService = inject(TranslateService);

  protected readonly today = new Date();

  protected readonly previewConsumptions = computed<FoodConsumptionResponse[]>(() => {
    this.translateService.currentLang();
    const base = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return [
      {
        id: 1,
        foodId: 1,
        foodName: this.translateService.instant('landing.preview.foods.apple'),
        amount: 150,
        phenylalanineAmount: 45,
        consumedAt: new Date(base.getTime() + (8 * 60 + 30) * 60000),
      },
      {
        id: 2,
        foodId: 2,
        foodName: this.translateService.instant('landing.preview.foods.bread'),
        amount: 80,
        phenylalanineAmount: 60,
        consumedAt: new Date(base.getTime() + (10 * 60 + 15) * 60000),
      },
      {
        id: 3,
        foodId: 3,
        foodName: this.translateService.instant('landing.preview.foods.rice'),
        amount: 200,
        phenylalanineAmount: 140,
        consumedAt: new Date(base.getTime() + 13 * 60 * 60000),
      },
      {
        id: 4,
        foodId: 4,
        foodName: this.translateService.instant('landing.preview.foods.salad'),
        amount: 180,
        phenylalanineAmount: 75,
        consumedAt: new Date(base.getTime() + (18 * 60 + 45) * 60000),
      },
    ];
  });
}
