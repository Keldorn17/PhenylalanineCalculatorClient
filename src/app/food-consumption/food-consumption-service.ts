import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiQueryParams, PagedResponse} from '../http/api-types';
import {Observable} from 'rxjs';
import {FoodConsumptionCreateRequest, FoodConsumptionRequest, FoodConsumptionResponse} from './food-consumption-types';
import {ApiPath} from '../http/api-path';

@Injectable({
  providedIn: 'root'
})
export class FoodConsumptionService {
  private readonly httpClient = inject(HttpClient);

  public getFoodConsumption(params: ApiQueryParams, date: Date): Observable<PagedResponse<FoodConsumptionResponse>> {
    return this.httpClient.get<PagedResponse<FoodConsumptionResponse>>('TODO');
  }

  public postFoodConsumption(foodConsumptionCreateRequest: FoodConsumptionCreateRequest): Observable<FoodConsumptionResponse> {
    return this.httpClient.post<FoodConsumptionResponse>(ApiPath.foodConsumption.post, foodConsumptionCreateRequest);
  }

  public deleteFoodConsumption(foodConsumptionId: number): Observable<void> {
    return this.httpClient.delete<void>(ApiPath.resolve(ApiPath.foodConsumption.delete, foodConsumptionId));
  }

  public putFoodConsumption(foodConsumptionId: number, foodConsumptionRequest: FoodConsumptionRequest): Observable<FoodConsumptionResponse> {
    return this.httpClient.put<FoodConsumptionResponse>(ApiPath.resolve(ApiPath.foodConsumption.put, foodConsumptionId), foodConsumptionRequest);
  }
}
