import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'progress-bar',
  imports: [
    MatCard,
    MatCardContent,
    MatProgressBar,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBar {
  public readonly current = input.required<number>();
  public readonly total = input.required<number>();
  public readonly unit = input<string>('mg');
  public readonly title = input<string>();
  public readonly height = input<number>(18);

  public readonly percentage = computed((): number => {
    const tot = this.total();
    if (tot <= 0) {
      return 0;
    }
    return Math.round((this.current() / tot) * 100);
  });

  public readonly progressValue = computed((): number => {
    return Math.min(Math.max(this.percentage(), 0), 100);
  });

  public readonly remaining = computed((): number => {
    return Math.max(0, this.total() - this.current());
  });

  public readonly exceeded = computed((): number => {
    return Math.max(0, this.current() - this.total());
  });

  public readonly isOverLimit = computed((): boolean => {
    return this.current() > this.total() && this.total() > 0;
  });

  public readonly isAtLimit = computed((): boolean => {
    return this.current() === this.total() && this.total() > 0;
  });
}
