export interface Recipe {
  id: string;
  product_id: string;
  supply_id: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface RecipeCreate {
  product_id: string;
  supply_id: string;
  quantity: number;
}

export interface RecipeUpdate {
  product_id?: string;
  supply_id?: string;
  quantity?: number;
}