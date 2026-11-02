import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, filter, map, of, switchMap } from 'rxjs';
import { ProgressBarService } from './progress-bar-service';
import { DailyIntakeService } from '../daily-intake/daily-intake-service';
import { UserService } from '../user/user-service';
import { DailyLimitDialog } from '../daily-limit-dialog/daily-limit-dialog';

@Component({
  selector: 'progress-bar',
  imports: [
    DecimalPipe,
    MatCard,
    MatCardContent,
    MatProgressBar,
    MatIcon,
    MatButton,
    TranslatePipe
  ],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBar {
  private readonly progressBarService = inject(ProgressBarService);
  private readonly dailyIntakeService = inject(DailyIntakeService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);

  public readonly current = input.required<number>();
  public readonly total = input<number | null>(null);
  public readonly unit = input<string>('mg');
  public readonly title = input<string>();
  public readonly height = input<number>(18);

  public readonly displayCurrent = linkedSignal<number>(() => this.current());
  public readonly displayTotal = linkedSignal<number | null>(() => this.total());

  public readonly hasDailyLimit = computed((): boolean => {
    const tot = this.displayTotal();
    return tot !== null && tot > 0;
  });

  public readonly percentage = computed((): number => {
    if (!this.hasDailyLimit()) {
      return 0;
    }
    const tot = this.displayTotal()!;
    return Math.round((this.displayCurrent() / tot) * 100);
  });

  public readonly progressValue = computed((): number => {
    return Math.min(Math.max(this.percentage(), 0), 100);
  });

  public readonly remaining = computed((): number => {
    if (!this.hasDailyLimit()) {
      return 0;
    }
    return Math.round(Math.max(0, this.displayTotal()! - this.displayCurrent()) * 100) / 100;
  });

  public readonly exceeded = computed((): number => {
    if (!this.hasDailyLimit()) {
      return 0;
    }
    return Math.round(Math.max(0, this.displayCurrent() - this.displayTotal()!) * 100) / 100;
  });

  public readonly isOverLimit = computed((): boolean => {
    return this.hasDailyLimit() && this.displayCurrent() > this.displayTotal()!;
  });

  public readonly isAtLimit = computed((): boolean => {
    return this.hasDailyLimit() && this.displayCurrent() === this.displayTotal()!;
  });

  public readonly baseAllowanceWidth = computed((): number => {
    if (!this.hasDailyLimit()) {
      return 0;
    }
    if (!this.isOverLimit()) {
      return this.progressValue();
    }
    return Math.round((this.displayTotal()! / this.displayCurrent()) * 10000) / 100;
  });

  public readonly overflowWidth = computed((): number => {
    if (!this.hasDailyLimit() || !this.isOverLimit()) {
      return 0;
    }
    return Math.round((100 - this.baseAllowanceWidth()) * 100) / 100;
  });

  constructor() {
    toObservable(this.progressBarService.refreshEvent)
      .pipe(
        filter(event => event !== null),
        switchMap(event =>
          this.dailyIntakeService.getDailyIntake(event.date).pipe(
            catchError(() =>
              this.userService.getUser().pipe(
                map(user => ({
                  date: event.date,
                  consumedPhenylalanine: 0,
                  dailyLimit: user.dailyLimit
                })),
                catchError(() =>
                  of({
                    date: event.date,
                    consumedPhenylalanine: 0,
                    dailyLimit: this.displayTotal()
                  })
                )
              )
            )
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe(intake => {
        this.displayCurrent.set(intake.consumedPhenylalanine);
        this.displayTotal.set(intake.dailyLimit);
      });
  }

  protected openSetLimitDialog(): void {
    this.dialog.open(DailyLimitDialog, {
      data: {
        dailyLimit: this.displayTotal() ?? undefined,
        descriptionTranslationKey: 'dailyLimitDialog.changeDescription'
      }
    });
  }
}
