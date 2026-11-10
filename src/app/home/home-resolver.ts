import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { DailyIntakeResponse } from '../daily-intake/daily-intake-types';
import { DailyIntakeService } from '../daily-intake/daily-intake-service';

export const getDailyIntakeResolver: ResolveFn<
  DailyIntakeResponse
> = (): Observable<DailyIntakeResponse> => {
  const dailyIntakeService = inject(DailyIntakeService);
  const today = new Date();

  return dailyIntakeService.getDailyIntake(today).pipe(
    catchError(() =>
      of({
        date: today,
        consumedPhenylalanine: 0,
        dailyLimit: null,
      }),
    ),
  );
};
