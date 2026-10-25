export interface FoodTypeResponse {
  id: number;
  name: string;
  multiplier: number;
  canEdit: boolean;
}

export interface FoodTypeRequest {
  name: string;
  multiplier: number;
}
