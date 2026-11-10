export interface FoodRequest {
  name: string;
  protein: number;
  calories: number;
  phenylalanine?: number;
  foodTypeId?: number;
  isPrivate?: boolean;
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
  isPrivate: boolean;
}
