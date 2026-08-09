export interface Category {
  id: string;
  site_id: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}
