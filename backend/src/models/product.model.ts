export interface Product {
  id: string;
  site_id: string;
  name: string;
  description?: string;
  sku: string;
  base_price: number;
  image_url?: string;
  category_id: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: { id: string; name: string };
}

export interface ProductCreate {
  name: string;
  description?: string;
  sku: string;
  base_price: number;
  image_url?: string;
  category_id: string;
  is_active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  sku?: string;
  base_price?: number;
  image_url?: string;
  category_id?: string;
  is_active?: boolean;
}
