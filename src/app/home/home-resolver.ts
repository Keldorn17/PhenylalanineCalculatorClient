import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {Observable} from 'rxjs';
import {DailyIntakeResponse} from '../daily-intake/daily-intake-types';
import {DailyIntakeService} from '../daily-intake/daily-intake-service';

export const getDailyIntakeResolver: ResolveFn<DailyIntakeResponse> = (): Observable<DailyIntakeResponse> => {
  return inject(DailyIntakeService).getDailyIntake(new Date());
};
