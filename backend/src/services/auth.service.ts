import { supabase } from '../config/supabase';

export class AuthService {
  // Obtener perfil del usuario autenticado (con roles y site)
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        display_name,
        email,
        phone_number,
        site_id,
        branch_id,
        is_active,
        sites(name),
        branches(name),
        user_roles(role_id)
      `)
      .eq('id', userId)
      .single();

    if (error) throw new Error(`Error al obtener perfil: ${error.message}`);
    return data;
  }

  // Actualizar perfil (display_name, phone_number)
  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar perfil: ${error.message}`);
    return data;
  }

  // Cambiar contraseña
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Obtener email del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) throw new Error(`Error al obtener usuario: ${userError.message}`);

    // Verificar credenciales actuales
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) throw new Error('La contraseña actual es incorrecta');

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) throw new Error(`Error al cambiar contraseña: ${updateError.message}`);
  }

  // Olvidé mi contraseña (envía email de restablecimiento)
  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) throw new Error(`Error al enviar correo: ${error.message}`);
  }

  // Restablecer contraseña con token
  async resetPassword(token: string, newPassword: string) {
    try {
      // Usar el token para autenticar al usuario (el token es un access_token)
      // Usamos _sessionData para evitar el error TS6133 (variable no usada)
      const { data: _sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', // No tenemos refresh_token, pero setSession lo acepta
      });

      if (sessionError) throw new Error(`Error al autenticar con token: ${sessionError.message}`);

      // Actualizar la contraseña del usuario autenticado
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw new Error(`Error al actualizar contraseña: ${updateError.message}`);

      // Cerrar sesión después del cambio
      await supabase.auth.signOut();
    } catch (err) {
      throw err;
    }
  }
}