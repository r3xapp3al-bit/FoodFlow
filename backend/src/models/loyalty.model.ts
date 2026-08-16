export interface LoyaltyPoints {
  id: string;
  customer_id: string;
  points: number;
  accumulated_points: number;
  redeemed_points: number;
  updated_at?: string;
}

export interface PointHistory {
  id: string;
  customer_id: string;
  points: number;
  concept: string;
  reference_id?: string;
  created_at?: string;
}

export type PointHistoryCreate = Omit<PointHistory, 'id' | 'created_at'>;