export interface Role {
  id: string;
  name: string;
  description?: string;
  level: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}

export type RoleCreate = Omit<Role, 'level'> & { level?: number };
export type RoleUpdate = Partial<Pick<Role, 'name' | 'description' | 'level'>>;
export type PermissionCreate = Omit<Permission, 'id'>;
export type PermissionUpdate = Partial<Pick<Permission, 'name' | 'description'>>;