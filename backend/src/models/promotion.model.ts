export interface Promotion {
  id: string;
  site_id: string;
  codigo: string;
  description?: string;
  type: 'PORCENTAJE' | 'MONTO_FIJO' | '2X1';
  value: number;
  product_id?: string;
  start_date: string;
  end_date: string;
  usage_per_customer?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface PromotionCreate {
  codigo: string;
  description?: string;
  type: 'PORCENTAJE' | 'MONTO_FIJO' | '2X1';
  value: number;
  product_id?: string;
  start_date: string;
  end_date: string;
  usage_per_customer?: number;
  is_active?: boolean;
}

export interface PromotionUpdate {
  codigo?: string;
  description?: string;
  type?: 'PORCENTAJE' | 'MONTO_FIJO' | '2X1';
  value?: number;
  product_id?: string;
  start_date?: string;
  end_date?: string;
  usage_per_customer?: number;
  is_active?: boolean;
}

export interface CouponUsage {
  id: string;
  promotion_id: string;
  order_id: string;
  customer_id: string;
  discount_applied: number;
  created_at?: string;
}

export interface CouponUsageCreate {
  promotion_id: string;
  order_id: string;
  customer_id: string;
  discount_applied: number;
}