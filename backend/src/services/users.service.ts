import { supabase } from '../config/supabase';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from '../schemas/users.schema';

export class UsersService {
  /**
   * Listar usuarios con filtros y paginación
   */
  async listUsers(query: ListUsersQuery) {
    const { limit, offset, search, site_id, branch_id, is_active, role } = query;

    let supabaseQuery = supabase
      .from('users')
      .select(`
        *,
        user_roles (role_id)
      `, { count: 'exact' });

    // Filtros
    if (search) {
      supabaseQuery = supabaseQuery.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (site_id) {
      supabaseQuery = supabaseQuery.eq('site_id', site_id);
    }
    if (branch_id) {
      supabaseQuery = supabaseQuery.eq('branch_id', branch_id);
    }
    if (is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', is_active);
    }
    if (role) {
      // Filtra usuarios que tengan un rol específico
      supabaseQuery = supabaseQuery.eq('user_roles.role_id', role);
    }

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al listar usuarios: ${error.message}`);
    }

    // Formatear respuesta para incluir roles como array
    const formattedData = data?.map(user => ({
      ...user,
      roles: user.user_roles?.map((ur: any) => ur.role_id) || [],
    })) || [];

    return {
      data: formattedData,
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Obtener un usuario por ID (con roles y permisos)
   */
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (role_id)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Usuario no encontrado: ${error.message}`);
    }

    // Obtener permisos del usuario (opcional)
    const roles = data.user_roles?.map((ur: any) => ur.role_id) || [];
    let permissions: string[] = [];
    if (roles.length > 0) {
      const { data: perms, error: permsError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .in('role_id', roles);

      if (!permsError && perms) {
        permissions = perms.map(p => p.permission_id);
      }
    }

    return {
      ...data,
      roles,
      permissions,
    };
  }

  /**
   * Crear un nuevo usuario (solo admin)
   * Nota: Usa la función handle_new_user de Supabase para sincronizar auth.users
   */
  async createUser(data: CreateUserInput) {
    const { email, password, display_name, phone_number, site_id, branch_id, roles } = data;

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar
      user_metadata: { display_name, phone_number },
    });

    if (authError) {
      throw new Error(`Error al crear usuario en Auth: ${authError.message}`);
    }

    const userId = authData.user.id;

    // 2. Actualizar la tabla `users` (el trigger handle_new_user ya creó el registro, pero actualizamos datos adicionales)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        display_name,
        phone_number,
        site_id: site_id || null,
        branch_id: branch_id || null,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Error al actualizar perfil: ${updateError.message}`);
    }

    // 3. Asignar roles
    if (roles && roles.length > 0) {
      const roleInserts = roles.map(role_id => ({
        user_id: userId,
        role_id,
      }));
      const { error: rolesError } = await supabase
        .from('user_roles')
        .insert(roleInserts);

      if (rolesError) {
        throw new Error(`Error al asignar roles: ${rolesError.message}`);
      }
    }

    // 4. Obtener el usuario completo
    return this.getUserById(userId);
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(userId: string, data: UpdateUserInput) {
    const { display_name, phone_number, site_id, branch_id, is_active } = data;

    const updateData: any = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (site_id !== undefined) updateData.site_id = site_id;
    if (branch_id !== undefined) updateData.branch_id = branch_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }

    return this.getUserById(userId);
  }

  /**
   * Eliminar (desactivar) un usuario
   */
  async deleteUser(userId: string) {
    // En lugar de eliminar, desactivamos (soft delete)
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    if (error) {
      throw new Error(`Error al desactivar usuario: ${error.message}`);
    }

    return { success: true, message: 'Usuario desactivado correctamente' };
  }

  /**
   * Asignar un rol a un usuario
   */
  async assignRole(userId: string, roleId: string) {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });

    if (error) {
      throw new Error(`Error al asignar rol: ${error.message}`);
    }

    return this.getUserById(userId);
  }

  /**
   * Quitar un rol de un usuario
   */
  async removeRole(userId: string, roleId: string) {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      throw new Error(`Error al quitar rol: ${error.message}`);
    }

    return this.getUserById(userId);
  }
}
