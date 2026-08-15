export interface Wastage {
  id: string;
  supply_id: string;
  branch_id: string;
  batch_id?: string;
  quantity: number;
  reason: 'DESCOMPOSICION' | 'ACCIDENTE' | 'DEGUSTACION' | 'TRANSPORTE' | 'OTRO';
  description?: string;
  registered_by: string;
  created_at?: string;
}

export type WastageCreate = Omit<Wastage, 'id' | 'created_at'>;
export type WastageUpdate = Partial<Omit<Wastage, 'id' | 'supply_id' | 'branch_id' | 'created_at'>>;