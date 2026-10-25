import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiPath} from '../http/api-path';
import {ApiQueryParams, PagedResponse} from '../http/api-types';
import {buildQueryParams} from '../http/api-utils';
import {FoodTypeRequest, FoodTypeResponse} from './food-type-types';

@Injectable({
  providedIn: 'root'
})
export class FoodTypeService {
  private readonly httpClient = inject(HttpClient);

  public getFoodTypeById(id: number): Observable<FoodTypeResponse> {
    return this.httpClient.get<FoodTypeResponse>(ApiPath.resolve(ApiPath.foodTypes.getById, id));
  }

  public getFoodTypes(params: ApiQueryParams): Observable<PagedResponse<FoodTypeResponse>> {
    const queryParams = buildQueryParams(params);
    return this.httpClient.get<PagedResponse<FoodTypeResponse>>(ApiPath.foodTypes.get, {params: queryParams});
  }

  public deleteFoodType(id: number): Observable<void> {
    return this.httpClient.delete<void>(ApiPath.resolve(ApiPath.foodTypes.delete, id));
  }

  public putFoodType(id: number, foodTypeRequest: FoodTypeRequest): Observable<FoodTypeResponse> {
    return this.httpClient.put<FoodTypeResponse>(ApiPath.resolve(ApiPath.foodTypes.put, id), foodTypeRequest);
  }

  public postFoodType(foodTypeRequest: FoodTypeRequest): Observable<FoodTypeResponse> {
    return this.httpClient.post<FoodTypeResponse>(ApiPath.foodTypes.post, foodTypeRequest);
  }
}
