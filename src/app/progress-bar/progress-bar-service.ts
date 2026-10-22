import {Injectable, signal} from '@angular/core';

export interface ProgressBarRefreshEvent {
  date: Date;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {
  private readonly activeDateSignal = signal<Date>(new Date());
  private readonly refreshSignal = signal<ProgressBarRefreshEvent | null>(null);

  public readonly activeDate = this.activeDateSignal.asReadonly();
  public readonly refreshEvent = this.refreshSignal.asReadonly();

  public setActiveDate(date: Date): void {
    this.activeDateSignal.set(date);
  }

  public triggerRefresh(date?: Date): void {
    const targetDate = date ?? this.activeDateSignal();
    if (date) {
      this.activeDateSignal.set(date);
    }
    this.refreshSignal.set({
      date: targetDate,
      timestamp: Date.now()
    });
  }
}
