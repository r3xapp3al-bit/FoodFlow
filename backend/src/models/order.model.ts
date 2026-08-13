// ── Order ──
export interface Order {
  id: string;
  site_id: string;
  branch_id: string;
  order_number: string;
  customer_id?: string;
  channel: 'POS' | 'WEB' | 'WHATSAPP' | 'LLAMADA';
  status: 'CREADO' | 'PAGADO' | 'RESERVADO' | 'PENDIENTE' | 'EMPAQUETADO' | 'LISTO' | 'ASIGNADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CERRADO' | 'CANCELADO' | 'NO_ENTREGADO';
  subtotal: number;
  total: number;
  delivery_cost: number;
  delivery_address?: string;
  address_id?: string;
  delivery_person_id?: string;
  preparation_time_min?: number;
  estimated_delivery_time_min?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string;
  delivered_at?: string;
  closed_at?: string;
}

export interface OrderCreate {
  branch_id: string;
  customer_id?: string;
  channel: 'POS' | 'WEB' | 'WHATSAPP' | 'LLAMADA';
  items: OrderItemCreate[];
  delivery_cost?: number;
  delivery_address?: string;
  address_id?: string;
  notes?: string;
  preparation_time_min?: number;
  estimated_delivery_time_min?: number;
}

export interface OrderUpdate {
  status?: Order['status'];
  delivery_cost?: number;
  delivery_address?: string;
  address_id?: string;
  delivery_person_id?: string;
  notes?: string;
  preparation_time_min?: number;
  estimated_delivery_time_min?: number;
}

// ── Order Item ──
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  toppings?: any; // JSONB
  created_at?: string;
}

export interface OrderItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
  toppings?: any;
}

// ── Payment ──
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: 'EFECTIVO' | 'QR_BCP' | 'YAPE' | 'TRANSFERENCIA' | 'TARJETA';
  reference?: string;
  status: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  confirmed_by?: string;
  confirmed_at?: string;
  created_at?: string;
}

export interface PaymentCreate {
  order_id: string;
  amount: number;
  method: Payment['method'];
  reference?: string;
}