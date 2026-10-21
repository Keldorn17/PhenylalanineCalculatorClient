import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {DailyIntakeResponse} from './daily-intake-types';
import {ApiPath} from '../http/api-path';

@Injectable({
  providedIn: 'root'
})
export class DailyIntakeService {
  private readonly httpClient = inject(HttpClient);

  public getDailyIntake(date: Date): Observable<DailyIntakeResponse> {
    const formattedDate = date.toISOString().split('T')[0];
    return this.httpClient.get<DailyIntakeResponse>(
      ApiPath.resolve(ApiPath.dailyIntake.get, formattedDate)
    );
  }
}
