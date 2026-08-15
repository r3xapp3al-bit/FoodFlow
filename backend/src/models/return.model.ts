export interface Return {
  id: string;
  order_id: string;
  customer_id: string;
  reason: string;
  refund_amount: number;
  status: 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'COMPLETADA';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type ReturnCreate = Omit<Return, 'id' | 'status' | 'created_at' | 'updated_at'>;
export type ReturnUpdate = Partial<Omit<Return, 'id' | 'order_id' | 'customer_id' | 'created_at' | 'updated_at'>>;