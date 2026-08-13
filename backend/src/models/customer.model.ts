// ── Customer ──
export interface Customer {
  id: string;
  auth_user_id?: string; // opcional: si está vinculado a un usuario del sistema
  name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerCreate {
  name: string;
  email?: string;
  phone?: string;
  auth_user_id?: string;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
}

// ── Customer Address ──
export interface CustomerAddress {
  id: string;
  customer_id: string;
  address: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface AddressCreate {
  customer_id: string;
  address: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  is_default?: boolean;
}

export interface AddressUpdate {
  address?: string;
  latitude?: number;
  longitude?: number;
  reference?: string;
  is_default?: boolean;
}