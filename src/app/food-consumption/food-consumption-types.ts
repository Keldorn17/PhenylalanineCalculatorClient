export interface FoodConsumptionCreateRequest {
  foodId: number;
  amount: number;
  consumedAt: Date;
}

export interface FoodConsumptionRequest {
  amount: number;
  consumedAt: Date;
}

export interface FoodConsumptionResponse {
  id: number;
  foodId: number;
  foodName: string;
  amount: number;
  phenylalanineAmount: number;
  consumedAt: Date;
}
