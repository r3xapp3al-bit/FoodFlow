import { supabase } from '../config/supabase';

export class AuthService {
  /**
   * Obtiene el perfil completo del usuario con roles y permisos
   */
  async getProfile(userId: string) {
    // 1. Obtener datos básicos del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email, phone_number, site_id, branch_id, is_active')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Usuario no encontrado');
    }

    // 2. Obtener roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId);

    if (rolesError) {
      throw new Error('Error al obtener roles');
    }

    const roleIds = roles.map(r => r.role_id);

    // 3. Obtener permisos (opcional, si quieres devolverlos)
    let permissions: string[] = [];
    if (roleIds.length > 0) {
      const { data: perms, error: permsError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .in('role_id', roleIds);

      if (!permsError && perms) {
        permissions = perms.map(p => p.permission_id);
      }
    }

    return {
      ...user,
      roles: roleIds,
      permissions,
    };
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  async hasRole(userId: string, roleId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();

    return !error && !!data;
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  async hasPermission(userId: string, permissionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        role_permissions!inner (
          permission_id
        )
      `)
      .eq('user_id', userId)
      .eq('role_permissions.permission_id', permissionId)
      .limit(1);

    return !error && data && data.length > 0;
  }
}