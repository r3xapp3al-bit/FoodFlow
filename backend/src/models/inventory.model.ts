// ── Inventory (stock actual) ──
export interface Inventory {
  id: string;
  insumo_id: string;
  branch_id: string;
  available_stock: number;
  reserved_stock: number;
  stock_total: number;
  reorder_point?: number;
  updated_at?: string;
}

export interface InventoryCreate {
  insumo_id: string;
  branch_id: string;
  available_stock?: number;
  reserved_stock?: number;
  reorder_point?: number;
}

export interface InventoryUpdate {
  available_stock?: number;
  reserved_stock?: number;
  reorder_point?: number;
}

// ── Batches (lotes) ──
export interface Batch {
  id: string;
  insumo_id: string;
  branch_id: string;
  lot_number: string;
  initial_quantity: number;
  current_quantity: number;
  production_date?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BatchCreate {
  insumo_id: string;
  branch_id: string;
  lot_number: string;
  initial_quantity: number;
  current_quantity?: number;
  production_date?: string;
  expiry_date?: string;
}

export interface BatchUpdate {
  lot_number?: string;
  current_quantity?: number;
  production_date?: string;
  expiry_date?: string;
}

// ── Inventory Movements ──
export type MovementType =
  | 'ENTRADA'
  | 'SALIDA'
  | 'RESERVA'
  | 'CONSUMO'
  | 'LIBERACION'
  | 'AJUSTE'
  | 'TRANSFERENCIA_SALIDA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'MERMA';

export interface InventoryMovement {
  id: string;
  insumo_id: string;
  branch_id: string;
  batch_id?: string;
  quantity: number;
  type: MovementType;
  reason?: string;
  reference_id?: string;
  user_id?: string;
  created_at?: string;
}

export interface InventoryMovementCreate {
  insumo_id: string;
  branch_id: string;
  batch_id?: string;
  quantity: number;
  type: MovementType;
  reason?: string;
  reference_id?: string;
  user_id?: string;
}