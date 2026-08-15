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

export type PaymentCreate = Omit<Payment, 'id' | 'status' | 'confirmed_by' | 'confirmed_at' | 'created_at'>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'order_id' | 'created_at'>>;