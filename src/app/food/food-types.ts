export interface FoodRequest {
  name: string;
  protein: number;
  calories: number;
  phenylalanine?: number;
  foodTypeId?: number;
}

export interface FoodResponse {
  id: number;
  name: string;
  protein: number;
  calories: number;
  phenylalanine: number;
  foodTypeName: string;
  multiplier: number;
  canEdit: boolean;
}
