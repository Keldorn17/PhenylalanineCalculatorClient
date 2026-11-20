import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyIntakeResponse } from './daily-intake-types';
import { ApiPath } from '../http/api-path';
import { formatIsoDate, getBrowserTimeZone } from '../http/api-utils';

@Injectable({
  providedIn: 'root',
})
export class DailyIntakeService {
  private readonly httpClient = inject(HttpClient);

  public getDailyIntake(
    date: Date,
    timezone: string | undefined = getBrowserTimeZone(),
  ): Observable<DailyIntakeResponse> {
    let params = new HttpParams().set('date', formatIsoDate(date));
    if (timezone) {
      params = params.set('timezone', timezone);
    }

    return this.httpClient.get<DailyIntakeResponse>(ApiPath.dailyIntake.get, { params });
  }
}
