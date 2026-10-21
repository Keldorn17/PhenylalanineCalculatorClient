import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ProgressBar} from '../progress-bar/progress-bar';
import {DailyIntakeResponse} from '../daily-intake/daily-intake-types';

@Component({
  selector: 'home',
  imports: [ProgressBar],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {
  public readonly dailyIntake = input.required<DailyIntakeResponse>();
}
