import { FoodResponse } from '../food-types';

export interface FoodDialogData {
  food?: FoodResponse;
}

export type PheInputMode = 'foodType' | 'direct';
