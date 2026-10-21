import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {DailyIntakeService} from './daily-intake-service';
import {DailyIntakeResponse} from './daily-intake-types';
import {ApiPath} from '../http/api-path';

describe('DailyIntakeService', () => {
  let service: DailyIntakeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DailyIntakeService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DailyIntakeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch daily intake for a given date', () => {
    const testDate = new Date('2026-10-21T12:00:00Z');
    const mockResponse: DailyIntakeResponse = {
      date: testDate,
      consumedPhenylalanine: 120,
      dailyLimit: 300
    };

    service.getDailyIntake(testDate).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const expectedUrl = ApiPath.resolve(ApiPath.dailyIntake.get, '2026-10-21');
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    httpMock.verify();
  });
});
