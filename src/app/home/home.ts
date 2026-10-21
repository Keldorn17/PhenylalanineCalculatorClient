import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal
} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {ProgressBar} from '../progress-bar/progress-bar';
import {ProgressBarService} from '../progress-bar/progress-bar-service';
import {DailyIntakeResponse} from '../daily-intake/daily-intake-types';
import {FoodConsumptionService} from '../food-consumption/food-consumption-service';
import {FoodConsumptionResponse} from '../food-consumption/food-consumption-types';
import {FoodConsumptionCard} from '../food-consumption/food-consumption-card/food-consumption-card';
import {DateSwitcher} from '../date-switcher/date-switcher';

@Component({
  selector: 'home',
  imports: [
    DatePipe,
    MatCard,
    MatCardContent,
    MatIcon,
    MatPaginator,
    MatProgressSpinner,
    TranslatePipe,
    ProgressBar,
    DateSwitcher,
    FoodConsumptionCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {
  private readonly progressBarService = inject(ProgressBarService);
  private readonly foodConsumptionService = inject(FoodConsumptionService);

  public readonly dailyIntake = input.required<DailyIntakeResponse>();

  protected readonly today = this.normalizeDate(new Date());
  protected readonly selectedDate = signal<Date>(this.today);

  protected readonly consumptions = signal<FoodConsumptionResponse[]>([]);
  protected readonly totalElements = signal<number>(0);
  protected readonly pageIndex = signal<number>(0);
  protected readonly pageSize = signal<number>(20);
  protected readonly pageSizeOptions = [10, 20, 40, 50];
  protected readonly isLoading = signal<boolean>(false);

  public ngOnInit(): void {
    this.progressBarService.setActiveDate(this.selectedDate());
    this.loadConsumptions();
  }

  public selectDate(date: Date): void {
    const normalized = this.normalizeDate(date);
    if (this.isSameDay(normalized, this.selectedDate())) {
      return;
    }

    this.selectedDate.set(normalized);
    this.pageIndex.set(0);
    this.progressBarService.triggerRefresh(normalized);
    this.loadConsumptions();
  }

  public onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadConsumptions();
  }

  public onConsumptionChanged(): void {
    this.loadConsumptions();
  }

  public isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private loadConsumptions(): void {
    this.isLoading.set(true);
    this.foodConsumptionService
      .getFoodConsumption(
        {
          page: this.pageIndex(),
          size: this.pageSize()
        },
        this.selectedDate()
      )
      .subscribe({
        next: response => {
          if (response.content.length === 0 && this.pageIndex() > 0 && response.page.totalElements > 0) {
            this.pageIndex.set(this.pageIndex() - 1);
            this.loadConsumptions();
            return;
          }
          this.consumptions.set(response.content);
          this.totalElements.set(response.page.totalElements);
          this.isLoading.set(false);
        },
        error: () => {
          this.consumptions.set([]);
          this.totalElements.set(0);
          this.isLoading.set(false);
        }
      });
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
