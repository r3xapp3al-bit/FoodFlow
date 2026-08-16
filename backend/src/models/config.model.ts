export interface Config {
  id: string;
  site_id: string;
  key: string;
  value?: string;
  description?: string;
  updated_at?: string;
}

export interface BranchConfig {
  id: string;
  branch_id: string;
  key: string;
  value?: string;
  description?: string;
  updated_at?: string;
}

export type ConfigCreate = Omit<Config, 'id' | 'updated_at'>;
export type ConfigUpdate = Partial<Pick<Config, 'value' | 'description'>>;

export type BranchConfigCreate = Omit<BranchConfig, 'id' | 'updated_at'>;
export type BranchConfigUpdate = Partial<Pick<BranchConfig, 'value' | 'description'>>;