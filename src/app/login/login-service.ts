import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodTypeResponse } from './login-types';
import { ApiPath } from '../http/api-path';
import { ApiQueryParams, PagedResponse } from '../http/api-types';
import { buildQueryParams } from '../http/api-utils';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly httpClient = inject(HttpClient);

  public getFoodTypeById(id: number): Observable<FoodTypeResponse> {
    return this.httpClient.get<FoodTypeResponse>(ApiPath.resolve(ApiPath.foodTypes.getById, id));
  }

  public getFoodTypes(params: ApiQueryParams): Observable<PagedResponse<FoodTypeResponse>> {
    const queryParams = buildQueryParams(params);
    return this.httpClient.get<PagedResponse<FoodTypeResponse>>(ApiPath.foodTypes.get, { params: queryParams });
  }
}
