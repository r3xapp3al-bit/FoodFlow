import { supabase } from '../config/supabase';
import { Role, Permission, RoleCreate, RoleUpdate, PermissionCreate, PermissionUpdate } from '../models/permission.model';
import { ListRolesQuery } from '../schemas/permission.schema';

export class PermissionService {
  // ─── Roles ────────────────────────────────────────
  async listRoles(query: ListRolesQuery) {
    const { limit, offset } = query;
    const { data, error, count } = await supabase
      .from('roles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('level', { ascending: true });

    if (error) throw new Error(`Error al listar roles: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getRoleById(id: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Rol no encontrado: ${error.message}`);
    return data;
  }

  async getRolePermissions(roleId: string) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permissions(*)')
      .eq('role_id', roleId);

    if (error) throw new Error(`Error al obtener permisos del rol: ${error.message}`);
    return data.map(item => item.permissions);
  }

  async createRole(payload: RoleCreate): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        ...payload,
        level: payload.level ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear rol: ${error.message}`);
    return data;
  }

  async updateRole(id: string, payload: RoleUpdate): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar rol: ${error.message}`);
    return data;
  }

  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    const { count, error: countError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id);

    if (countError) throw new Error(countError.message);
    if (count && count > 0) {
      throw new Error('No se puede eliminar el rol porque tiene usuarios asociados');
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar rol: ${error.message}`);
    return { success: true, message: 'Rol eliminado correctamente' };
  }

  // ─── Permisos ──────────────────────────────────────
  async listPermissions() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true });

    if (error) throw new Error(`Error al listar permisos: ${error.message}`);
    return data || [];
  }

  async getPermissionById(id: string): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Permiso no encontrado: ${error.message}`);
    return data;
  }

  async createPermission(payload: PermissionCreate): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Error al crear permiso: ${error.message}`);
    return data;
  }

  async updatePermission(id: string, payload: PermissionUpdate): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar permiso: ${error.message}`);
    return data;
  }

  async deletePermission(id: string): Promise<{ success: boolean; message: string }> {
    const { count, error: countError } = await supabase
      .from('role_permissions')
      .select('*', { count: 'exact', head: true })
      .eq('permission_id', id);

    if (countError) throw new Error(countError.message);
    if (count && count > 0) {
      throw new Error('No se puede eliminar el permiso porque está asignado a roles');
    }

    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar permiso: ${error.message}`);
    return { success: true, message: 'Permiso eliminado correctamente' };
  }

  // ─── Asignar permisos a roles ──────────────────────
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<{ success: boolean; message?: string }> {
    const { error } = await supabase
      .from('role_permissions')
      .insert({ role_id: roleId, permission_id: permissionId });

    if (error) {
      if (error.code === '23505') {
        return { success: false, message: 'El permiso ya está asignado a este rol' };
      }
      throw new Error(`Error al asignar permiso: ${error.message}`);
    }
    return { success: true, message: 'Permiso asignado correctamente' };
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<{ success: boolean; message?: string }> {
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId);

    if (error) throw new Error(`Error al quitar permiso: ${error.message}`);
    return { success: true, message: 'Permiso quitado correctamente' };
  }
}