import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiQueryParams, PagedResponse} from '../http/api-types';
import {Observable} from 'rxjs';
import {FoodRequest, FoodResponse, FoodUpdateRequest} from './food-types';
import {ApiPath} from '../http/api-path';
import {buildQueryParams} from '../http/api-utils';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private readonly httpClient = inject(HttpClient);

  public getFoods(params: ApiQueryParams): Observable<PagedResponse<FoodResponse>> {
    const queryParams = buildQueryParams(params);
    return this.httpClient.get<PagedResponse<FoodResponse>>(ApiPath.food.get, { params: queryParams })
  }

  public getByIdFood(id: number): Observable<FoodResponse> {
    return this.httpClient.get<FoodResponse>(ApiPath.resolve(ApiPath.food.getById, id));
  }

  public postFood(foodRequest: FoodRequest): Observable<FoodResponse> {
    return this.httpClient.post<FoodResponse>(ApiPath.food.post, foodRequest);
  }

  public putFood(id: number, foodUpdateRequest: FoodUpdateRequest): Observable<FoodResponse> {
    return this.httpClient.patch<FoodResponse>(ApiPath.resolve(ApiPath.food.patch, id), foodUpdateRequest);
  }

  public deleteFood(id: number): Observable<void> {
    return this.httpClient.delete<void>(ApiPath.resolve(ApiPath.food.delete, id));
  }
}
