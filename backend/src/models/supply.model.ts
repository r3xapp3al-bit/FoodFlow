export interface Supply {
  id: string;
  site_id: string;
  name: string;
  unit: string;
  min_stock?: number;
  unit_cost?: number;
  is_perishable?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupplyCreate {
  name: string;
  unit: string;
  min_stock?: number;
  unit_cost?: number;
  is_perishable?: boolean;
}

export interface SupplyUpdate {
  name?: string;
  unit?: string;
  min_stock?: number;
  unit_cost?: number;
  is_perishable?: boolean;
}