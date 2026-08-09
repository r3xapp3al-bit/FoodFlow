export interface AuthUser {
  id: string;
  email: string;
  site_id: string;
  branch_id?: string;
  roles: string[];
  display_name?: string;
}
